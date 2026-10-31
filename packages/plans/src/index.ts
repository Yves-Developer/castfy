/**
 * Castfy's pricing, as the website states it (apps/web/config/data.ts):
 *
 *   Free    5 demos, ever. Full app, 1080p, no watermark.
 *   Castfy  one payment, unlimited demos.
 *
 * The paid tier is a one-time Polar product, not a subscription. The backend
 * grants it from Polar's order webhooks (packages/backend/convex/auth.ts) and
 * counts demos against the free limit (billing.ts).
 */

// Guarded: this module is also imported in browsers (the desktop app's
// renderer), where there is no `process`. Only server code reads it, through
// getProducts().
const POLAR_ENVIRONMENT = (
  typeof process === "undefined" ? undefined : process.env.POLAR_ENVIRONMENT
) as PlanEnvironment | undefined;

export type PlanEnvironment = "production" | "sandbox";

export type PlanKey = "free" | "lifetime";

/** The one paid product. Its key is the checkout slug the app sends. */
export const PRODUCTS = {
  production: {
    lifetime: { id: "REPLACE_WITH_POLAR_PRODUCT_ID", name: "Castfy" },
  },
  sandbox: {
    lifetime: { id: "REPLACE_WITH_POLAR_PRODUCT_ID", name: "Castfy" },
  },
} as const;

export type ProductSlug = keyof (typeof PRODUCTS)["production"];

/** True until the Polar product exists and its id replaces the placeholder. */
export function isPlaceholderProduct(id: string): boolean {
  return id.startsWith("REPLACE_");
}

export function getProducts() {
  if (!POLAR_ENVIRONMENT) {
    throw new Error("POLAR_ENVIRONMENT must be 'production' or 'sandbox'");
  }
  return PRODUCTS[POLAR_ENVIRONMENT];
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
    demos: plan === "lifetime" ? "unlimited" : FREE_DEMO_LIMIT,
    // Both tiers export 1080p with no watermark; the limit is the only
    // difference.
    exportQuality: "1080p",
    watermark: false,
  };
}

export function getPlanName(plan: PlanKey): string {
  return plan === "lifetime" ? "Castfy" : "Free";
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
  key: PlanKey;
  price: string;
  title: string;
}

/** The two tiers as the app shows them; worded like the website. */
export const TIERS: Record<PlanKey, PlanTier> = {
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
