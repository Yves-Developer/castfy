import {
  BotIcon,
  DatabaseIcon,
  ImageIcon,
  LinkIcon,
  SendIcon,
  SparklesIcon,
} from "lucide-react";
import { AiFillInstagram } from "react-icons/ai";
import { FaDiscord, FaLinkedin, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { FAQItem, Testimonial } from "@/types";
import { siteConfig } from "./site";
export const demoVideoUrl =
  "https://pub-79872054c8cb4a23b5f90577293ece4f.r2.dev/Framer%20Update_%20CMS%203.0.mp4";
export const navLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "How",
    href: "/#joureny",
  },

  {
    label: "Why us",
    href: "/#why-us",
  },
  {
    label: "Features",
    href: "/#features",
  },

  {
    label: "Pricing",
    href: "/#pricing",
  },
  {
    label: "Contact Us",
    href: "/contact",
  },
];

export const steps = [
  {
    title: "Enter your product URL + Prompt",
    subtitle:
      "Paste your product URL + Prompt and let AI analyze your product, messaging, and key features automatically.",
    mobileSubtitle:
      "Paste your URL + Prompt and let AI extract your product details instantly.",
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
      "URL + prompt → Castfy runs the flow",
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
export const demos = [
  {
    title: "Vendyy",
    slug: "fatherhood-tech",
    description: "@vendyy",
    media:
      "https://pub-79872054c8cb4a23b5f90577293ece4f.r2.dev/Castfy/demo-with-audio-clean.mp4",
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

export const features = [
  {
    icon: LinkIcon,
    title: "URL to Demo",
    description:
      "Paste any URL and let AI instantly turn it into a polished, shareable product demo — no recording or editing required.",
  },
  {
    icon: BotIcon,
    title: "AI-Powered Generation",
    description:
      "AI analyzes the page and automatically generates a walkthrough, highlighting key screens, features, and flows in seconds.",
  },
  {
    icon: ImageIcon,
    title: "Custom Backgrounds",
    description:
      "Personalize every demo with custom backgrounds, gradients, or brand colors to match your product's look and feel.",
  },
  {
    icon: SparklesIcon,
    title: "Smart Enhancements",
    description:
      "Automatically clean up UI clutter, add smooth transitions, and enhance visuals so every demo looks professional by default.",
  },
  {
    icon: DatabaseIcon,
    title: "Demo Storage & Library",
    description:
      "All your generated demos are saved and organized in one place, so you can revisit, reuse, or update them anytime.",
  },
  {
    icon: SendIcon,
    title: "Instant Sharing",
    description:
      "Share your demo with a single link or embed it anywhere, making it easy for teams, clients, or prospects to view instantly.",
  },
];
export const plans = [
  {
    title: "Starter",
    slug: "starter",
    desc: "Everything you need to get going",
    price: {
      monthly: "$32",
      yearly: "$32",
    },
    credits: 20,
    features: [
      "20 AI minutes / month",
      "10 demos / month",
      "No watermark",
      "Custom branding",
      "2 versions per video",
      "Multi-language support (29 languages)",
      "Export in 1080p",
      "Email support",
    ],
    cta: "Join waiting list",
  },
  {
    title: "Pro",
    slug: "pro",
    popular: true,
    desc: "More power as your business grows",
    price: {
      monthly: "$79",
      yearly: "$79",
    },
    credits: 50,
    features: [
      "50 AI minutes / month",
      "50 demos / month",
      "No watermark",
      "Custom branding",
      "5 versions per video",
      "Multi-language support (29 languages)",
      "Export in 1440p (2K)",
      "Documint documentation exports",
      "Priority support",
    ],
    cta: "Join waiting list",
  },
  {
    title: "Business",
    slug: "business",
    desc: "Built for high-volume teams",
    price: {
      monthly: "$200",
      yearly: "$200",
    },
    credits: 150,
    features: [
      "150 AI minutes / month",
      "Unlimited demos",
      "No watermark",
      "Custom branding",
      "10 versions per video",
      "Multi-language support (29 languages)",
      "Export in 4K quality",
      "Documint documentation exports",
      "Dedicated support",
    ],
    cta: "Join waiting list",
  },
];
export const footerNavs = [
  // services

  {
    group: "products",
    categories: [
      {
        title: "Product",
        navs: [
          { label: "Flexible Collections", href: "/", external: false },
          {
            label: "Automatic Slugs",
            href: "/",
            external: false,
          },
          {
            label: "Rich Content Fields",
            href: "/",
            external: false,
          },
          {
            label: "Dynamic Publishing",
            href: "/",
            external: false,
          },
          {
            label: "AI-Powered CMS",
            href: "/",
            external: false,
          },
        ],
      },
    ],
  },
  // products
  {
    group: "Businesses",
    categories: [
      {
        title: "Quick Navs",
        navs: [
          {
            label: "Home",
            href: "/",
            external: false,
          },
          {
            label: "Features",
            href: "/#features",
            external: false,
          },
          {
            label: "Faqs",
            href: "/#faqs",
            external: false,
          },
          {
            label: "Enterprise ",
            href: "/#pricing",
            external: false,
          },

          {
            label: "Pricing",
            href: "/#pricing",
            external: false,
          },
        ],
      },
    ],
  },
  // business
  {
    group: "Business",
    categories: [
      {
        title: "Company",
        navs: [
          {
            label: "About Us",
            href: "/about",
            external: false,
          },
          {
            label: "Book a call",
            href: "/book-a-call",
            external: false,
          },
          {
            label: "News",
            href: "/news",
            external: false,
          },
          {
            label: "Careers",
            href: "/careers",
            external: false,
          },
          {
            label: "Referrals",
            href: "/referrals",
            external: false,
          },
        ],
      },
    ],
  },
  {
    group: "More",
    categories: [
      {
        title: "More",
        navs: [
          {
            label: "Sitemap",
            href: "/sitemap.xml",
            external: false,
          },
          {
            label: "LLMs",
            href: "/llms.txt",
            external: false,
          },
        ],
      },
    ],
  },
  // policies
  {
    group: "Policies",
    categories: [
      {
        title: "Terms & Policies",
        navs: [
          {
            label: "Terms of Use",
            href: "/policies/terms-of-use",
            external: false,
          },
          {
            label: "Privacy Policy",
            href: "/policies/privacy-policy",
            external: false,
          },
          {
            label: "Other Policies",
            href: "/policies",
            external: false,
          },
        ],
      },
    ],
  },
];

export const footerSocialIcons = [
  { icon: FaXTwitter, href: siteConfig.links.x },
  { icon: FaLinkedin, href: siteConfig.links.linkedin },
  { icon: AiFillInstagram, href: siteConfig.links.instagram },
  { icon: FaTiktok, href: "" },
  { icon: FaDiscord, href: "" },
];
