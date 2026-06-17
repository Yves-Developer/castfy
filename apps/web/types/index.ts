export interface TUseCase {
  description: string;
  media: string;
  slug: string;
  title: string;
  type: string;
}

export interface Testimonial {
  company: string;
  content: string;
  country: string;
  image?: string;
  name: string;
  title: string;
}

export interface FAQItem {
  answer: string;
  question: string;
}
