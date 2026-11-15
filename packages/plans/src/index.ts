/**
 * Castfy's pricing, as the website states it (apps/web/config/data.ts):
 *
 *   Castfy  one payment, unlimited demos, no watermark.
 *   Beta    a tester's beta code, unlimited demos while the beta runs, no
 *           watermark.
 *
 * There is no free tier. An account with neither (key "free", shown as "No
 * plan") cannot record: its demo limit is 0.
 *
 * The paid tier is a one-time Dodo Payments product, not a subscription. The
 * backend grants it from Dodo's payment webhooks (packages/backend/convex/
 * auth.ts); billing.ts refuses recordings for an account without a plan.
 */

// Guarded: this module is also imported in browsers (the desktop app's
// renderer), where there is no `process`. Only server code reads it, through
// getProducts().
const DODO_ENVIRONMENT = (
  typeof process === "undefined"
    ? undefined
    : process.env.DODO_PAYMENTS_ENVIRONMENT
) as PlanEnvironment | undefined;

/**
 * The paid product's id, from the Convex dashboard when set: going live is
 * then a change of keys, mode and this id, without a code change. Falls back
 * to PRODUCTS below. Guarded like DODO_ENVIRONMENT.
 */
const DODO_PRODUCT_ID =
  typeof process === "undefined"
    ? undefined
    : process.env.DODO_PRODUCT_ID?.trim() || undefined;

/** Dodo's two modes: test_mode takes test cards, live_mode real ones. */
export type PlanEnvironment = "live_mode" | "test_mode";

export type PlanKey = "free" | "lifetime" | "beta";

/** The plans anyone can pick; "beta" is only granted by a beta code. */
export type TierKey = Exclude<PlanKey, "beta">;

/**
 * The one paid product, by Dodo mode. Its key is the checkout slug the app
 * sends. Product ids (pdt_…) are in the Dodo dashboard under Products; test
 * and live mode each have their own.
 */
export const PRODUCTS = {
  live_mode: {
    lifetime: { id: "REPLACE_WITH_DODO_PRODUCT_ID", name: "Castfy" },
  },
  test_mode: {
    lifetime: { id: "pdt_0NqxqbqCVlEPwWckl7ZHE", name: "Castfy" },
  },
} as const;

export type ProductSlug = keyof (typeof PRODUCTS)["live_mode"];

/** True until the Dodo product exists and its id replaces the placeholder. */
export function isPlaceholderProduct(id: string): boolean {
  return id.startsWith("REPLACE_");
}

export function getProducts() {
  if (!DODO_ENVIRONMENT) {
    throw new Error(
      "DODO_PAYMENTS_ENVIRONMENT must be 'live_mode' or 'test_mode'"
    );
  }
  const products = PRODUCTS[DODO_ENVIRONMENT];
  if (!DODO_PRODUCT_ID) {
    return products;
  }
  return { lifetime: { ...products.lifetime, id: DODO_PRODUCT_ID } };
}

/** The plan a product grants, or null for a product this app doesn't sell. */
export function getPlanByProductId(productId: string): PlanKey | null {
  const product = Object.values(getProducts()).find((p) => p.id === productId);
  return product ? "lifetime" : null;
}

/**
 * Demos an account without a plan may make: none. Castfy has no free tier;
 * a beta code or a purchase is the way in. Still a number, not a removed
 * plan, so the backend, castfy0 and older apps keep one code path: a limit
 * of 0 reads as "needs a plan", above 0 as "free demos used up".
 */
export const FREE_DEMO_LIMIT = 0;

export interface PlanLimits {
  demos: number | "unlimited";
  exportQuality: "1080p";
  watermark: boolean;
}

export function getPlanLimits(plan: PlanKey): PlanLimits {
  return {
    demos: plan === "free" ? FREE_DEMO_LIMIT : "unlimited",
    exportQuality: "1080p",
    // Free videos carry a small Castfy watermark; paid and beta ones don't.
    watermark: plan === "free",
  };
}

const PLAN_NAMES: Record<PlanKey, string> = {
  free: "No plan",
  lifetime: "Castfy",
  beta: "Beta",
};

export function getPlanName(plan: PlanKey): string {
  return PLAN_NAMES[plan];
}

/** The paid tier's price. `regular` is the price after launch. */
export const PRICE = {
  amount: 29,
  regular: 49,
  /** How many buyers get `amount` before it goes up to `regular`. */
  earlyBuyers: 20,
  currency: "USD",
  symbol: "$",
} as const;

export interface PlanTier {
  description: string;
  features: string[];
  key: TierKey;
  price: string;
  title: string;
}

/** The two tiers as the app shows them; worded like the website. */
export const TIERS: Record<TierKey, PlanTier> = {
  free: {
    key: "free",
    title: "Private beta",
    price: "Free with a beta code",
    description: "For testers, while the beta runs.",
    features: [
      "Unlimited demos, no watermark",
      "The full app, every feature",
      "Runs on the agent subscription you already pay for",
      "No code yet? Join the waitlist at castfy.app",
    ],
  },
  lifetime: {
    key: "lifetime",
    title: "Castfy",
    price: `${PRICE.symbol}${PRICE.amount}`,
    description: `One time. ${PRICE.symbol}${PRICE.amount} for the first ${PRICE.earlyBuyers} buyers, then ${PRICE.symbol}${PRICE.regular}.`,
    features: [
      "Unlimited demos, no watermark",
      "Every feature, 1080p export",
      "Re-run any flow when your UI changes",
      "A year of updates, and the version you bought keeps working forever",
    ],
  },
};
