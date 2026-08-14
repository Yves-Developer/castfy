import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";

/** How long a claim is good for before the reaper may take the job back. */
const LEASE_MS = 90_000;

/**
 * Requeue ceiling. Only infrastructure faults should ever get here — an agent
 * that genuinely can't find the checkout button will fail the same way twice
 * and re-bill the whole loop, so `fail` marks terminal rather than retrying.
 */
const MAX_ATTEMPTS = 3;

/** Ceiling on queued work; see the note in `enqueue`. */
const MAX_QUEUE_DEPTH = 25;

/**
 * The worker is a separate process, so it can only reach *public* functions.
 * These would otherwise let any browser claim, complete, or fail other people's
 * jobs, so every worker-facing entry point takes this secret and checks it
 * against the value set in the Convex dashboard.
 */
function assertWorker(secret: string): void {
  const expected = process.env.PLAYGROUND_WORKER_SECRET;
  if (!expected) {
    throw new Error(
      "PLAYGROUND_WORKER_SECRET is not set on the Convex deployment. " +
        "Set it with `npx convex env set PLAYGROUND_WORKER_SECRET <value>`."
    );
  }
  // Compare every character regardless of where the first mismatch is, so the
  // duration doesn't leak the shared secret. The V8 runtime has no
  // timingSafeEqual, and accumulating differences avoids an early return.
  let differences = secret.length === expected.length ? 0 : 1;
  for (let i = 0; i < secret.length; i++) {
    if (secret.charCodeAt(i) !== expected.charCodeAt(i % expected.length)) {
      differences += 1;
    }
  }
  if (differences !== 0) {
    throw new Error("Invalid worker secret");
  }
}

/**
 * Ownership chokepoint. Auth is deliberately deferred, so today this only
 * stamps null — but every read path already calls it, so switching to
 * `ctx.auth.getUserIdentity()` is a one-function change.
 */
function requireOwner(_ctx: MutationCtx): string | null {
  return null;
}

/**
 * Cheap shape check only. Convex functions cannot resolve DNS, so the real
 * SSRF defence — resolve the host and reject private ranges — lives in the
 * worker immediately before navigation, which is also the only place immune to
 * a DNS rebind between validation and use.
 */
function assertUrlShape(raw: string): void {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("URL is not valid");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("URL must be http or https");
  }
}

export const enqueue = mutation({
  args: {
    url: v.string(),
    promptGoal: v.string(),
    headless: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!args.promptGoal.trim()) {
      throw new Error("Goal/Instructions are required for the recording");
    }
    assertUrlShape(args.url);

    // Until auth lands this mutation is reachable by anyone who has the
    // deployment URL — and that URL ships in the dashboard's client bundle.
    // A depth cap is a blunt instrument, but it bounds what an abuser can
    // spend in one go. Replace with a per-user quota in Phase 3.
    const backlog = await ctx.db
      .query("jobs")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "queued"))
      .take(MAX_QUEUE_DEPTH + 1);
    if (backlog.length > MAX_QUEUE_DEPTH) {
      throw new Error("Queue is full. Please retry shortly.");
    }

    return await ctx.db.insert("jobs", {
      status: "queued",
      url: args.url,
      promptGoal: args.promptGoal,
      headless: args.headless ?? true,
      ownerId: requireOwner(ctx),
      createdAt: Date.now(),
      attempts: 0,
      lastSeq: 0,
    });
  },
});

/**
 * Atomically hand the oldest queued job to one worker. Convex mutations are
 * serializable transactions, so two workers calling this concurrently cannot
 * both win the same row — no advisory lock or SKIP LOCKED needed.
 */
export const claimNext = mutation({
  args: { workerSecret: v.string(), workerId: v.string() },
  handler: async (ctx, args) => {
    assertWorker(args.workerSecret);

    const job = await ctx.db
      .query("jobs")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "queued"))
      .order("asc")
      .first();

    if (!job) {
      return null;
    }

    const now = Date.now();
    await ctx.db.patch(job._id, {
      status: "running",
      workerId: args.workerId,
      leaseExpiresAt: now + LEASE_MS,
      startedAt: job.startedAt ?? now,
      attempts: job.attempts + 1,
    });

    return {
      jobId: job._id,
      url: job.url,
      promptGoal: job.promptGoal,
      headless: job.headless,
    };
  },
});

/**
 * Extends the lease and doubles as the cancellation channel: the worker learns
 * a job was cancelled from the return value and aborts, which tears down the
 * MCP child and its browser rather than billing on.
 */
export const heartbeat = mutation({
  args: {
    workerSecret: v.string(),
    jobId: v.id("jobs"),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorker(args.workerSecret);

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return { keepGoing: false, reason: "missing" as const };
    }
    if (job.status === "cancelled") {
      return { keepGoing: false, reason: "cancelled" as const };
    }
    // Reaped and handed to someone else while we were slow; stop immediately
    // so two workers never drive the same job.
    if (job.status !== "running" || job.workerId !== args.workerId) {
      return { keepGoing: false, reason: "lost-lease" as const };
    }

    await ctx.db.patch(args.jobId, { leaseExpiresAt: Date.now() + LEASE_MS });
    return { keepGoing: true, reason: "ok" as const };
  },
});

export const appendEvent = mutation({
  args: {
    workerSecret: v.string(),
    jobId: v.id("jobs"),
    type: v.union(
      v.literal("status"),
      v.literal("step"),
      v.literal("completed"),
      v.literal("error")
    ),
    message: v.optional(v.string()),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    assertWorker(args.workerSecret);

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Unknown job");
    }

    const seq = job.lastSeq + 1;
    await ctx.db.patch(args.jobId, { lastSeq: seq });
    await ctx.db.insert("jobEvents", {
      jobId: args.jobId,
      seq,
      type: args.type,
      message: args.message,
      data: args.data,
      createdAt: Date.now(),
    });
    return seq;
  },
});

export const complete = mutation({
  args: {
    workerSecret: v.string(),
    jobId: v.id("jobs"),
    videos: v.record(v.string(), v.string()),
    usage: v.optional(
      v.object({ inputTokens: v.number(), outputTokens: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    assertWorker(args.workerSecret);
    await ctx.db.patch(args.jobId, {
      status: "completed",
      videos: args.videos,
      usage: args.usage,
      finishedAt: Date.now(),
      leaseExpiresAt: undefined,
    });
  },
});

export const fail = mutation({
  args: {
    workerSecret: v.string(),
    jobId: v.id("jobs"),
    error: v.string(),
    /** Transport faults may be requeued; agent failures are terminal. */
    retryable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    assertWorker(args.workerSecret);

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      return;
    }

    const canRetry = args.retryable === true && job.attempts < MAX_ATTEMPTS;
    await ctx.db.patch(args.jobId, {
      status: canRetry ? "queued" : "failed",
      error: args.error,
      workerId: undefined,
      leaseExpiresAt: undefined,
      finishedAt: canRetry ? undefined : Date.now(),
    });
  },
});

/** User-initiated stop. The worker notices on its next heartbeat and aborts. */
export const cancel = mutation({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Unknown job");
    }
    if (job.status === "completed" || job.status === "failed") {
      return;
    }
    await ctx.db.patch(args.jobId, {
      status: "cancelled",
      finishedAt: Date.now(),
    });
  },
});

export const get = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args): Promise<Doc<"jobs"> | null> =>
    await ctx.db.get(args.jobId),
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Doc<"jobs">[]> =>
    await ctx.db
      .query("jobs")
      .withIndex("by_owner", (q) => q.eq("ownerId", null))
      .order("desc")
      .take(args.limit ?? 50),
});

/**
 * Progress feed. `since` is the last seq the client rendered; Convex pushes
 * subsequent rows reactively, so a reconnect replays the gap with no
 * Last-Event-ID plumbing on our side.
 */
export const events = query({
  args: { jobId: v.id("jobs"), since: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Doc<"jobEvents">[]> =>
    await ctx.db
      .query("jobEvents")
      .withIndex("by_job_seq", (q) =>
        q.eq("jobId", args.jobId).gt("seq", args.since ?? 0)
      )
      .order("asc")
      .collect(),
});

/** Queue depth, for the autoscaling signal Phase 3 will want. */
export const pendingCount = query({
  args: {},
  handler: async (ctx): Promise<number> => {
    const queued = await ctx.db
      .query("jobs")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "queued"))
      .take(100);
    return queued.length;
  },
});

/**
 * Requeue jobs whose worker stopped renewing — a container that was OOM-killed
 * or scaled in mid-job. Without this those rows sit in "running" forever.
 */
export const reapExpiredLeases = mutation({
  args: {},
  handler: async (ctx): Promise<number> => {
    const now = Date.now();
    const stale = await ctx.db
      .query("jobs")
      .withIndex("by_status_lease", (q) =>
        q.eq("status", "running").lt("leaseExpiresAt", now)
      )
      .take(25);

    let reaped = 0;
    for (const job of stale) {
      const terminal = job.attempts >= MAX_ATTEMPTS;
      await ctx.db.patch(job._id as Id<"jobs">, {
        status: terminal ? "failed" : "queued",
        workerId: undefined,
        leaseExpiresAt: undefined,
        error: terminal
          ? `Worker lease expired after ${job.attempts} attempt(s)`
          : undefined,
        finishedAt: terminal ? now : undefined,
      });
      reaped += 1;
    }
    return reaped;
  },
});
