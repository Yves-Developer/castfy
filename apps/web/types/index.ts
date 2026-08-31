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
  cta: string;
  desc: string;
  features: string[];
  note?: string;
  price: string;
  title: string;
  was?: string;
}
