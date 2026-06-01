export interface TUseCase {
  description: string;
  media: string;
  slug: string;
  title: string;
  type: string;
}

export interface Testimonial {
  name: string;
  title: string;
  company: string;
  country: string;
  content: string;
  fullContent: string;
  image?: string;
  video?: string;
  videoPoster?: string;
}
