/** biome-ignore-all lint/style/useConsistentTypeDefinitions: <explanation */
const POLAR_ENVIRONMENT = process.env.POLAR_ENVIRONMENT as
  | "production"
  | "sandbox";

export const PLANS = {
  production: {
    starter: {
      id: "ac17601d-29a9-4530-ab9d-9f6ea39f7e32",
      name: "Starter",
      key: "starter",
      interval: "month",
    },
    starter_yearly: {
      id: "f304b841-5b5f-416b-90f3-4af518d27399",
      name: "Starter Yearly",
      key: "starter",
      interval: "year",
    },
    pro: {
      id: "0a0a36b1-38d3-4082-85ca-f46cec9d8b1a",
      name: "Pro",
      key: "pro",
      interval: "month",
    },
    pro_yearly: {
      id: "a1b1bef6-fd61-447c-84c5-33b602e1b854",
      name: "Pro Yearly",
      key: "pro",
      interval: "year",
    },
    business: {
      id: "REPLACE_WITH_POLAR_PRODUCT_ID",
      name: "Business",
      key: "business",
      interval: "month",
    },
    business_yearly: {
      id: "REPLACE_WITH_POLAR_PRODUCT_ID",
      name: "Business Yearly",
      key: "business",
      interval: "year",
    },
  },
  sandbox: {
    starter: {
      id: "265b6845-4fca-4813-86b7-70fb606626dd",
      name: "Starter",
      key: "starter",
      interval: "month",
    },
    starter_yearly: {
      id: "7437aadf-9571-4f20-989e-9a6d30b71947",
      name: "Starter Yearly",
      key: "starter",
      interval: "year",
    },
    pro: {
      id: "dc9e75d2-c1ef-4265-9265-f599e54eb172",
      name: "Pro",
      key: "pro",
      interval: "month",
    },
    pro_yearly: {
      id: "439697ce-73ad-439f-8b73-c5bee854a811",
      name: "Pro Yearly",
      key: "pro",
      interval: "year",
    },
    business: {
      id: "REPLACE_WITH_POLAR_PRODUCT_ID",
      name: "Business",
      key: "business",
      interval: "month",
    },
    business_yearly: {
      id: "REPLACE_WITH_POLAR_PRODUCT_ID",
      name: "Business Yearly",
      key: "business",
      interval: "year",
    },
  },
} as const;

export type PlanKey = "starter" | "pro" | "business";
export type PlanProductKey =
  | "starter"
  | "starter_yearly"
  | "pro"
  | "pro_yearly"
  | "business"
  | "business_yearly";

export type PlanEnvironment = "production" | "sandbox";

export const getPlans = () => PLANS[POLAR_ENVIRONMENT];

export function getPlanProductId(plan: PlanKey, yearly: boolean): string {
  const plans = getPlans();
  const productKey: PlanProductKey = yearly ? `${plan}_yearly` : plan;
  return plans[productKey].id;
}

export function getPlanByProductId(productId: string): PlanKey {
  const plans = getPlans();
  const plan = Object.values(plans).find((p) => p.id === productId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan.key as PlanKey;
}

export function getPlanIntervalByProductId(
  productId: string
): "month" | "year" {
  const plans = getPlans();
  const plan = Object.values(plans).find((p) => p.id === productId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  return plan.interval;
}

export function getPlanName(plan: string | null | undefined): string {
  switch (plan) {
    case "starter":
      return "Starter";
    case "pro":
      return "Pro";
    case "business":
      return "Business";
    case "trial":
      return "Free Trial";
    default:
      return "Free Trial";
  }
}

export type PlanLimits = {
  aiMinutes: number;
  demos: number | "unlimited";
  versionsPerVideo: number;
  exportQuality: "1080p" | "1440p" | "4k";
  multiLanguage: boolean;
  watermark: boolean;
};

export type PlanPricing = {
  starter: { monthly: number; yearly: number };
  pro: { monthly: number; yearly: number };
  business: { monthly: number; yearly: number };
  currency: string;
  symbol: string;
};

export function getPlanPricing(continent?: string | null): PlanPricing {
  const isEUR = continent === "EU";
  return {
    // Yearly numbers aren't in the screenshot — placeholders below, update once finalized.
    starter: { monthly: 40, yearly: 32 },
    pro: { monthly: 99, yearly: 79 },
    business: { monthly: 250, yearly: 200 },
    currency: isEUR ? "EUR" : "USD",
    symbol: isEUR ? "€" : "$",
  };
}

export type PlanFeature = {
  label: string;
  tooltip?: string;
  disabled?: boolean; // true = shown but greyed out / not included
};

export const freeTrialFeatures: PlanFeature[] = [
  { label: "2 AI minutes" },
  { label: "1 demo" },
  { label: "1080p export quality" },
  { label: "No custom branding", disabled: true },
  { label: "No multi-language support", disabled: true },
];

export const starterFeatures: PlanFeature[] = [
  { label: "20 AI minutes / month" },
  { label: "10 demos / month" },
  { label: "No watermark" },
  { label: "Custom branding" },
  { label: "2 versions per video" },
  { label: "Multi-language support (29 languages)" },
  { label: "Export in 1080p" },
  { label: "Email support" },
];

export const proFeatures: PlanFeature[] = [
  { label: "50 AI minutes / month" },
  { label: "50 demos / month" },
  { label: "No watermark" },
  { label: "Custom branding" },
  { label: "5 versions per video" },
  { label: "Multi-language support (29 languages)" },
  { label: "Export in 1440p (2K)" },
  {
    label: "Docusmith documentation exports",
    tooltip: "TODO: add tooltip copy",
  },
  { label: "Priority support" },
];

export const businessFeatures: PlanFeature[] = [
  { label: "150 AI minutes / month" },
  { label: "Unlimited demos" },
  { label: "No watermark" },
  { label: "Custom branding" },
  { label: "10 versions per video" },
  { label: "Multi-language support (29 languages)" },
  { label: "Export in 4K quality" },
  {
    label: "Docusmith documentation exports",
    tooltip: "TODO: add tooltip copy",
  },
  { label: "Dedicated support" },
];

/** @deprecated Use starterFeatures instead */
export const planFeatures = starterFeatures;

export function getPlanLimits(plan: string): PlanLimits {
  switch (plan) {
    case "starter":
      return {
        aiMinutes: 20,
        demos: 10,
        versionsPerVideo: 2,
        exportQuality: "1080p",
        multiLanguage: true,
        watermark: false,
      };
    case "pro":
      return {
        aiMinutes: 50,
        demos: 50,
        versionsPerVideo: 5,
        exportQuality: "1440p",
        multiLanguage: true,
        watermark: false,
      };
    case "business":
      return {
        aiMinutes: 150,
        demos: "unlimited",
        versionsPerVideo: 10,
        exportQuality: "4k",
        multiLanguage: true,
        watermark: false,
      };
    case "trial":
    default:
      return {
        aiMinutes: 2,
        demos: 1,
        versionsPerVideo: 1,
        exportQuality: "1080p",
        multiLanguage: false,
        watermark: true,
      };
  }
}
