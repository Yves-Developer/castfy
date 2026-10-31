import {
  getPlanByProductId,
  getPlanLimits,
  getPlanName,
  type PlanKey,
} from "@castfy/plans";
import { v } from "convex/values";
import { components } from "./_generated/api";
import {
  internalMutation,
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Payment statuses that still grant the paid tier. A partial refund is a
 * goodwill credit, not a return; a full refund ends it.
 */
const ENTITLED_STATUSES = new Set(["paid", "partially_refunded"]);

/**
 * Upper bound on the export rows read to count usage. Comfortably above the
 * free limit; the paid tier is unlimited and never needs an exact count.
 */
const MAX_COUNTED_EXPORTS = 1000;

/** The product's plan, or null for a product @castfy/plans doesn't know. */
function planOf(productId: string | null): PlanKey | null {
  if (!productId) {
    return null;
  }
  try {
    return getPlanByProductId(productId);
  } catch {
    // DODO_PAYMENTS_ENVIRONMENT unset: no product can be recognised.
    return null;
  }
}

/** Characters for beta codes: no 0/O or 1/I/L, which read alike. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
const CODE_PATTERN = /^BETA-[A-Z0-9]{4,12}$/;

/** The beta code the user redeemed, while it still grants the beta plan. */
async function activeBetaCode(ctx: QueryCtx, userId: string) {
  const code = await ctx.db
    .query("betaCodes")
    .withIndex("by_redeemer", (q) => q.eq("redeemedBy", userId))
    .first();
  if (!code) {
    return null;
  }
  if (code.expiresAt !== undefined && code.expiresAt <= Date.now()) {
    return null;
  }
  return code;
}

/**
 * "lifetime" if the user holds a paid order for it, "beta" while their beta
 * code is valid, else "free". A purchase wins: a tester who buys keeps it
 * after the beta.
 */
async function planFor(ctx: QueryCtx, userId: string): Promise<PlanKey> {
  const purchases = await ctx.db
    .query("purchases")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const owns = purchases.some(
    (p) => ENTITLED_STATUSES.has(p.status) && planOf(p.productId) === "lifetime"
  );
  if (owns) {
    return "lifetime";
  }
  return (await activeBetaCode(ctx, userId)) ? "beta" : "free";
}

/** Demos the user has exported, ever, capped at MAX_COUNTED_EXPORTS. */
async function countExports(ctx: QueryCtx, userId: string): Promise<number> {
  const rows = await ctx.db
    .query("exports")
    .withIndex("by_user_createdAt", (q) => q.eq("userId", userId))
    .take(MAX_COUNTED_EXPORTS);
  return rows.length;
}

/**
 * Everything the app needs to draw the account: who is signed in, their plan,
 * its limits and what they've used. Null when signed out.
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return null;
    }

    const plan = await planFor(ctx, user._id);
    const limits = getPlanLimits(plan);
    const used = await countExports(ctx, user._id);
    const beta = plan === "beta" ? await activeBetaCode(ctx, user._id) : null;

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      },
      plan: {
        key: plan,
        name: getPlanName(plan),
        betaCode: beta?.code ?? null,
        betaEndsAt: beta?.expiresAt ?? null,
      },
      limits,
      usage: {
        demos: used,
        remaining:
          limits.demos === "unlimited"
            ? null
            : Math.max(0, limits.demos - used),
      },
    };
  },
});

/**
 * Called by the desktop app before it renders an export. Spends one of the
 * free demos unless this demo was already exported, and returns the settings
 * the render must use.
 *
 * Refusal is a return value, not a throw: running out is an expected state
 * the app shows a buy prompt for, not an error.
 */
export const beginExport = mutation({
  args: { demoId: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const plan = await planFor(ctx, user._id);
    const limits = getPlanLimits(plan);
    const render = {
      watermark: limits.watermark,
      exportQuality: limits.exportQuality,
    };

    const alreadyCounted = await ctx.db
      .query("exports")
      .withIndex("by_user_demo", (q) =>
        q.eq("userId", user._id).eq("demoId", args.demoId)
      )
      .first();
    if (alreadyCounted) {
      return { allowed: true as const, ...render };
    }

    if (limits.demos !== "unlimited") {
      const used = await countExports(ctx, user._id);
      if (used >= limits.demos) {
        return {
          allowed: false as const,
          reason: "limit_reached" as const,
          plan,
          limit: limits.demos,
        };
      }
    }

    await ctx.db.insert("exports", {
      userId: user._id,
      demoId: args.demoId,
      createdAt: Date.now(),
    });
    return { allowed: true as const, ...render };
  },
});

/**
 * The user a payment belongs to: the checkout's referenceId (the app sends the
 * signed-in user's id), or else the user with the payment's email.
 */
async function payerOf(
  ctx: MutationCtx,
  referenceId: string | null,
  email: string
): Promise<string | null> {
  if (referenceId) {
    return referenceId;
  }
  const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [{ field: "email", value: email }],
  });
  return (user as { _id?: string } | null)?._id ?? null;
}

/**
 * Records a successful Dodo payment (payment.succeeded). Keyed on Dodo's
 * payment id, so a webhook delivered twice lands the same; a refund that
 * arrived first is kept.
 */
export const recordPayment = internalMutation({
  args: {
    paymentId: v.string(),
    customerId: v.string(),
    email: v.string(),
    referenceId: v.union(v.string(), v.null()),
    productId: v.union(v.string(), v.null()),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await payerOf(ctx, args.referenceId, args.email);
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
      .unique();
    const row = {
      paymentId: args.paymentId,
      customerId: args.customerId,
      userId: userId ?? existing?.userId ?? null,
      productId: args.productId,
      paidAt: args.paidAt,
      updatedAt: Date.now(),
    };
    if (existing) {
      // Only fill in what the refund could not know; never undo a refund.
      await ctx.db.patch(existing._id, row);
      return null;
    }
    await ctx.db.insert("purchases", { ...row, status: "paid" });
    return null;
  },
});

/**
 * Records a successful refund (refund.succeeded): a full refund ends the paid
 * tier, a partial one keeps it. Before the payment itself has arrived, the
 * refund is kept on a placeholder row the payment then completes.
 */
export const recordRefund = internalMutation({
  args: {
    paymentId: v.string(),
    customerId: v.string(),
    partial: v.boolean(),
  },
  handler: async (ctx, args) => {
    const status = args.partial ? "partially_refunded" : "refunded";
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_payment", (q) => q.eq("paymentId", args.paymentId))
      .unique();
    if (existing) {
      // A full refund is final; a later partial one does not reopen it.
      if (existing.status !== "refunded") {
        await ctx.db.patch(existing._id, { status, updatedAt: Date.now() });
      }
      return null;
    }
    await ctx.db.insert("purchases", {
      paymentId: args.paymentId,
      customerId: args.customerId,
      userId: null,
      productId: null,
      status,
      paidAt: 0,
      updatedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Redeems a tester's beta code for the signed-in user. A code belongs to the
 * first account that redeems it; that account can redeem it again harmlessly.
 * Failure is a return value with a message the app shows as is.
 */
export const redeemBetaCode = mutation({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.getAuthUser(ctx);
    const code = args.code.trim().toUpperCase();
    if (!CODE_PATTERN.test(code)) {
      return {
        ok: false as const,
        error: "A beta code looks like BETA-7K2QXP.",
      };
    }
    const row = await ctx.db
      .query("betaCodes")
      .withIndex("by_code", (q) => q.eq("code", code))
      .unique();
    if (!row) {
      return {
        ok: false as const,
        error: "That beta code doesn't exist. Check it and try again.",
      };
    }
    if (row.expiresAt !== undefined && row.expiresAt <= Date.now()) {
      return { ok: false as const, error: "That beta code has ended." };
    }
    if (row.redeemedBy && row.redeemedBy !== user._id) {
      return {
        ok: false as const,
        error: "That beta code is already used by another account.",
      };
    }
    if (!row.redeemedBy) {
      await ctx.db.patch(row._id, {
        redeemedBy: user._id,
        redeemedAt: Date.now(),
      });
    }
    return { ok: true as const };
  },
});

function randomCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  const body = Array.from(
    bytes,
    (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]
  ).join("");
  return `BETA-${body}`;
}

/**
 * Makes beta codes, one per tester. From packages/backend:
 *
 *   npx convex run billing:createBetaCodes '{"count": 20, "note": "first wave"}'
 *
 * Prints the codes; hand one to each tester.
 */
export const createBetaCodes = internalMutation({
  args: {
    count: v.number(),
    note: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const codes: string[] = [];
    while (codes.length < args.count) {
      const code = randomCode();
      const taken = await ctx.db
        .query("betaCodes")
        .withIndex("by_code", (q) => q.eq("code", code))
        .unique();
      if (taken || codes.includes(code)) {
        continue;
      }
      await ctx.db.insert("betaCodes", {
        code,
        note: args.note,
        expiresAt: args.expiresAt,
        createdAt: Date.now(),
      });
      codes.push(code);
    }
    return codes;
  },
});

/**
 * Ends the beta: every code stops granting the beta plan at `at` (ms since
 * the epoch; now when left out). Testers fall back to Free, or keep Castfy if
 * they bought it.
 *
 *   npx convex run billing:endBeta '{}'
 */
export const endBeta = internalMutation({
  args: { at: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const at = args.at ?? Date.now();
    const codes = await ctx.db.query("betaCodes").collect();
    for (const code of codes) {
      await ctx.db.patch(code._id, { expiresAt: at });
    }
    return codes.length;
  },
});
