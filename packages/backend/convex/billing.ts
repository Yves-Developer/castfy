import {
  getPlanByProductId,
  getPlanLimits,
  getPlanName,
  type PlanKey,
} from "@castfy/plans";
import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { authComponent } from "./auth";

/**
 * Order statuses that still grant the paid tier. A partial refund is a
 * goodwill credit, not a return; a full refund or a voided order ends it.
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
    // POLAR_ENVIRONMENT unset: no product can be recognised.
    return null;
  }
}

/** "lifetime" if the user holds a paid order for it, else "free". */
async function planFor(ctx: QueryCtx, userId: string): Promise<PlanKey> {
  const purchases = await ctx.db
    .query("purchases")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const owns = purchases.some(
    (p) => ENTITLED_STATUSES.has(p.status) && planOf(p.productId) === "lifetime"
  );
  return owns ? "lifetime" : "free";
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

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      },
      plan: { key: plan, name: getPlanName(plan) },
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
 * Applies one Polar order event. Upserts on Polar's id, so a webhook
 * delivered twice, or "refunded" arriving before "paid", lands the same.
 */
export const upsertPurchase = internalMutation({
  args: {
    polarOrderId: v.string(),
    polarCustomerId: v.string(),
    userId: v.union(v.string(), v.null()),
    productId: v.union(v.string(), v.null()),
    status: v.string(),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    const row = { ...args, updatedAt: Date.now() };
    const existing = await ctx.db
      .query("purchases")
      .withIndex("by_polar_order", (q) =>
        q.eq("polarOrderId", args.polarOrderId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, row);
      return null;
    }
    await ctx.db.insert("purchases", row);
    return null;
  },
});
