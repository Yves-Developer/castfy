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

export const steps = [
  {
    title: "Enter your product URL",
    subtitle:
      "Paste your product URL and let AI analyze your product, messaging, and key features automatically.",
    mobileSubtitle:
      "Paste your URL and let AI extract your product details instantly.",
    illustration: "/images/dashboard-dark.svg",
  },
  {
    title: "Generate your demo",
    subtitle:
      "AI creates a polished product demo in minutes, complete with engaging flows and clear messaging.",
    mobileSubtitle: "Get a ready-to-share product demo generated in minutes.",
    illustration: "/images/dashboard-dark.svg",
  },
  {
    title: "Add your final touch",
    subtitle:
      "Customize the content, branding, and experience before exporting your demo in multiple formats.",
    mobileSubtitle: "Edit, personalize, and export your demo anywhere.",
    illustration: "/images/dashboard-dark.svg",
  },
];

export const comparisonData = [
  {
    label: "Before",
    title: "Manual",
    items: [
      "Hours to days from recording to final video",
      "Record 5–10 takes to avoid stumbles",
      "Re-record when UI changes (every release)",
      "Edit cuts, zooms, and pacing manually",
      "Write captions + transcript after the fact",
      "Create variants (persona/region) from scratch",
      "Chase approvals in Slack threads",
      "Demos end up outdated in weeks",
    ],
    type: "negative",
  },
  {
    label: "After",
    title: "Castfy",
    items: [
      "Few minutes from URL to shareable demo",
      "URL + prompt → Demosmith runs the flow",
      "Auto-cuts + UI-aware zooms for key actions",
      "Captions + narration (optional) generated",
      "Brand kit applied (logo/colors/intro/outro)",
      "Generate variants for personas + regions",
      "Export MP4 + shareable link",
      "Store in a demo library for reuse",
    ],
    type: "positive",
    cta: "Join waitlist",
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
