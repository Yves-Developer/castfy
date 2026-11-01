/**
 * Castfy's pricing, as the website states it (apps/web/config/data.ts):
 *
 *   Free    5 demos, ever. Full app, 1080p, no watermark.
 *   Castfy  one payment, unlimited demos.
 *   Beta    a tester's beta code, unlimited demos while the beta runs.
 *
 * The paid tier is a one-time Dodo Payments product, not a subscription. The
 * backend grants it from Dodo's payment webhooks (packages/backend/convex/
 * auth.ts) and counts demos against the free limit (billing.ts).
 */

// Guarded: this module is also imported in browsers (the desktop app's
// renderer), where there is no `process`. Only server code reads it, through
// getProducts().
const DODO_ENVIRONMENT = (
  typeof process === "undefined"
    ? undefined
    : process.env.DODO_PAYMENTS_ENVIRONMENT
) as PlanEnvironment | undefined;

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
  return PRODUCTS[DODO_ENVIRONMENT];
}

/** The plan a product grants, or null for a product this app doesn't sell. */
export function getPlanByProductId(productId: string): PlanKey | null {
  const product = Object.values(getProducts()).find((p) => p.id === productId);
  return product ? "lifetime" : null;
}

/** Demos the free tier may export, over the account's whole life. */
export const FREE_DEMO_LIMIT = 5;

export interface PlanLimits {
  demos: number | "unlimited";
  exportQuality: "1080p";
  watermark: boolean;
}

export function getPlanLimits(plan: PlanKey): PlanLimits {
  return {
    demos: plan === "free" ? FREE_DEMO_LIMIT : "unlimited",
    // Both tiers export 1080p with no watermark; the limit is the only
    // difference.
    exportQuality: "1080p",
    watermark: false,
  };
}

const PLAN_NAMES: Record<PlanKey, string> = {
  free: "Free",
  lifetime: "Castfy",
  beta: "Beta",
};

export function getPlanName(plan: PlanKey): string {
  return PLAN_NAMES[plan];
}

/** The paid tier's price. `regular` is the price after launch. */
export const PRICE = {
  amount: 99,
  regular: 149,
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
    title: "Free",
    price: `${FREE_DEMO_LIMIT} demos, free`,
    description: "No watermark, no card, no expiry.",
    features: [
      "The full app, every feature",
      "1080p export with no watermark",
      "Runs on the agent subscription you already pay for",
      "No API key to add, no usage bill",
    ],
  },
  lifetime: {
    key: "lifetime",
    title: "Castfy",
    price: `${PRICE.symbol}${PRICE.amount}`,
    description: `One time. ${PRICE.symbol}${PRICE.amount} at launch, ${PRICE.symbol}${PRICE.regular} after.`,
    features: [
      "Unlimited demos",
      "Everything in Free, without the limit",
      "Re-run any flow when your UI changes",
      "A year of updates, and the version you bought keeps working forever",
    ],
  },
};
