import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * A recording job. The row is the record of truth: it outlives the HTTP request
 * that created it, the worker that runs it, and the browser tab watching it.
 */
export const jobStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("failed"),
  v.literal("cancelled")
);

export const eventType = v.union(
  v.literal("status"),
  v.literal("step"),
  v.literal("completed"),
  v.literal("error")
);

export default defineSchema({
  jobs: defineTable({
    status: jobStatus,

    // Inputs, exactly what the old query string carried.
    url: v.string(),
    promptGoal: v.string(),
    headless: v.boolean(),

    /**
     * Null until an auth layer exists. Every query that will eventually filter
     * by owner already goes through requireOwner() in jobs.ts, so turning auth
     * on is a change in one place rather than a scavenger hunt.
     */
    ownerId: v.union(v.string(), v.null()),

    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),

    /**
     * Lease held by whichever worker claimed the job. A worker that dies stops
     * renewing, the lease goes stale, and the reaper cron requeues the job —
     * this is what stops a crashed container from stranding work forever.
     */
    workerId: v.optional(v.string()),
    leaseExpiresAt: v.optional(v.number()),

    /** Incremented on requeue, so a poison job can't loop indefinitely. */
    attempts: v.number(),

    /** Monotonic per job; the cursor a reconnecting client resumes from. */
    lastSeq: v.number(),

    error: v.optional(v.string()),

    /** Variant key ("raw", "clean", "audio", "audioClean") to playable URL. */
    videos: v.optional(v.record(v.string(), v.string())),

    /** Populated from response.usage so spend is attributable per job. */
    usage: v.optional(
      v.object({
        inputTokens: v.number(),
        outputTokens: v.number(),
      })
    ),
  })
    // Claiming: oldest queued job first.
    .index("by_status_createdAt", ["status", "createdAt"])
    // Reaping: running jobs whose lease has lapsed.
    .index("by_status_lease", ["status", "leaseExpiresAt"])
    .index("by_owner", ["ownerId", "createdAt"]),

  /**
   * Append-only progress log. This replaces the Redis Stream from the original
   * plan: a client subscribes with a `since` cursor and Convex pushes new rows
   * reactively, so a refresh mid-job replays what it missed for free.
   */
  jobEvents: defineTable({
    jobId: v.id("jobs"),
    seq: v.number(),
    type: eventType,
    message: v.optional(v.string()),
    /**
     * Free-form step detail. Convex caps a document at 1 MiB, and agent
     * snapshots can be far larger, so the worker truncates before sending —
     * see EVENT_PAYLOAD_LIMIT in the worker.
     */
    data: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_job_seq", ["jobId", "seq"]),

  /**
   * One-time payments for the paid tier, mirrored from Dodo Payments'
   * webhooks (auth.ts). Dodo stays the record of truth; this copy makes a
   * plan check one indexed read rather than an API call on every export.
   */
  purchases: defineTable({
    /** Dodo's payment id (pay_…). */
    paymentId: v.string(),
    /** Dodo's customer id (cus_…). */
    customerId: v.string(),
    /**
     * The Better Auth user id: the checkout's referenceId, or else the user
     * with the payment's email. Null for a payment no user can be matched to
     * (e.g. made by hand in the Dodo dashboard), which no one can claim.
     */
    userId: v.union(v.string(), v.null()),
    productId: v.union(v.string(), v.null()),
    /** "paid", "partially_refunded" or "refunded". */
    status: v.string(),
    paidAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_payment", ["paymentId"])
    .index("by_user", ["userId"]),

  /**
   * Personal beta codes (BETA-XXXXXX), made with `npx convex run
   * billing:createBetaCodes`. Each is for one tester: redeeming it grants the
   * beta plan, unlimited demos, until the code expires.
   */
  betaCodes: defineTable({
    code: v.string(),
    /** Who it was made for, to tell testers apart. */
    note: v.optional(v.string()),
    /** The beta plan ends at this time; unset, it lasts until endBeta. */
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    /** The tester who redeemed it, once someone has. */
    redeemedBy: v.optional(v.string()),
    redeemedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_redeemer", ["redeemedBy"]),

  /**
   * One row per demo exported. The free tier limits demos over the account's
   * life, not render attempts, so re-exporting the same demo reuses its row
   * instead of spending another one (billing.ts beginExport).
   */
  exports: defineTable({
    userId: v.string(),
    /** The desktop app's project id for the demo. */
    demoId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_createdAt", ["userId", "createdAt"])
    .index("by_user_demo", ["userId", "demoId", "createdAt"]),
});
