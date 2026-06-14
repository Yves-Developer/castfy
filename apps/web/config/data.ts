import type { FAQItem, Testimonial, TUseCase } from "@/types";

export const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Features",
    href: "/#features",
  },

  {
    label: "Use Cases",
    href: "/#use-cases",
  },
  {
    label: "Testimonials",
    href: "/#testimonails",
  },

  {
    label: "Pricing",
    href: "/#pricing",
  },
  {
    label: "Faqs",
    href: "/#faqs",
  },
];

export const usaCases: TUseCase[] = [
  {
    title: "Vendyy",
    slug: "fatherhood-tech",
    description: "@vendyy",
    media: "https://screen.studio/videos/features/auto-zoom-on-clicks.mp4",
    type: "branding",
  },
  {
    title: "Rathon",
    slug: "teachers-day",
    description: "@rathon",
    media: "https://screen.studio/videos/hero/hero-demo.mp4",
    type: "design",
  },
  {
    title: "Notion",
    slug: "beautiful-development",
    description: "@notion",
    media: "https://screen.studio/videos/features/auto-zoom-on-clicks.mp4",
    type: "development",
  },
  {
    title: "Vercel",
    slug: "beautiful-photography",
    description: "@vercel",
    media: "https://screen.studio/videos/hero/hero-demo.mp4",
    type: "photography",
  },
  {
    title: "KuluChat",
    slug: "beautiful-video",
    description: "@kuluchat",
    media: "https://screen.studio/videos/features/auto-zoom-on-clicks.mp4",
    type: "video",
  },
];

export const faqs: FAQItem[] = [
  {
    question: "What is Castfy?",
    answer:
      "Midday is a business workspace for one-person companies. It brings transactions, receipts, invoices, time tracking, and files into one connected system so you always know what's going on in your business.",
  },
  {
    question: "Who is Castfy for?",
    answer:
      "Midday is built for founders running their company on their own who want clarity and control over their business without spending time on manual admin or spreadsheets.",
  },
  {
    question: "Do I need video editing knowledge to use Castfy?",
    answer:
      "No. Midday is designed for day-to-day use by non-financial users. It helps you stay organized, informed, and in control without requiring accounting expertise.",
  },
  {
    question: "How does Castfy make demo videos?",
    answer:
      "Midday connects to over 25,000 banks worldwide. Once connected, transactions are imported automatically and kept up to date.",
  },
  {
    question: "How do demo videos are made in Castfy?",
    answer:
      "Receipts and invoices can be pulled automatically from connected email accounts, synced from existing folders, or uploaded manually. They are then matched to transactions so everything stays organized.",
  },

  {
    question: "What are weekly updates?",
    answer:
      "Weekly updates are automatic summaries that highlight what changed in your business and what's worth paying attention to, so you don't have to check everything constantly.",
  },
  {
    question: "Can I create product demos in Castfy?",
    answer:
      "Yes. You can create one-off, recurring, scheduled, and web invoices. Invoice activity is reflected directly in your overview.",
  },
];

export const defaultTestimonials: Testimonial[] = [
  {
    name: "Paweł Michalski",
    title: "",
    company: "VC Leaders",
    country: "Poland",
    image: "/stories/pawel.jpeg",
    content:
      "Castfy helps us showcase products instantly. Instead of recording walkthroughs, we simply paste a URL and share a polished interactive demo.",
  },
  {
    name: "Facu Montanaro",
    title: "",
    company: "Kundo Studio",
    country: "Argentina",
    image: "/stories/facu.jpeg",
    content:
      "We use Castfy for every product launch. It makes explaining products dramatically easier than screenshots or lengthy videos.",
  },
  {
    name: "Richard Poelderl",
    title: "",
    company: "Conduct",
    country: "Germany",
    image: "/stories/richard.jpeg",
    content:
      "The ability to turn any product URL into a demo has completely changed how we present products to prospects and clients.",
  },
  {
    name: "Guy Solan",
    title: "",
    company: "Thetis Medical",
    country: "United Kingdom",
    image: "/stories/guy.jpeg",
    content:
      "Castfy makes it incredibly easy to demonstrate our platform. Prospects can explore the product before ever speaking with our team.",
  },
];
