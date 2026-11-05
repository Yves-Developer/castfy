export interface TUseCase {
  description: string;
  media: string;
  slug: string;
  title: string;
  type: string;
}

export interface FAQItem {
  answer: string;
  question: string;
}

export interface PricingTier {
  /** A short tag on the card, e.g. "Launch price". */
  badge?: string;
  cta: string;
  desc: string;
  features: string[];
  note?: string;
  price: string;
  title: string;
  /** What the price is for: "5 demos", "once". */
  unit?: string;
  was?: string;
}
