import type { Testimonial, TUseCase } from "@/types";

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
    label: "Pricing",
    href: "/#pricing",
  },
  {
    label: "Use Cases",
    href: "/#use-cases",
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

export const homeFaqs = [
  {
    value: "faq-1",
    question: "How long does it take get demo?",
    answer:
      "It really depends on what you need. Most websites take around 3 to 6 weeks. If it’s something simple, it can be faster. Bigger or more custom sites take a bit more time.",
  },
  {
    value: "faq-2",
    question: "Will my website work on phones and tablets?",
    answer:
      "Yes, for sure. Every site we build is fully responsive, so it’ll look and work great on phones, tablets, laptops and any other devices.",
  },
  {
    value: "faq-3",
    question: "Can I make changes to the site after it's done?",
    answer:
      "Definitely. We make sure you have access to update things like text and images yourself. And if you ever need help, we’re here for that too.",
  },
  {
    value: "faq-4",
    question: "Where can I find your pricing?",
    answer:
      "We’ve got a full pricing page with everything you need to know. Feel free to check it out or reach out if you’re unsure what fits best.",
  },
  {
    value: "faq-5",
    question: "What if I don’t have a logo or branding yet?",
    answer:
      "No problem at all. We can help you create a simple brand identity like a logo, colors, and fonts to make sure your site feels polished and consistent.",
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
      "Invoice reconciliation used to take a full day each month and was always stressful. With Midday, that work is mostly gone and we finally have a clear financial overview.",
    fullContent:
      "Company\nVC Leaders is an educational platform helping venture capitalists build better VC firms.\n\nChallenge\nMonthly invoice reconciliation was slow and painful. Missing invoices, manual checks, and no time left to properly categorize or analyze spending. The process regularly took more than a full day.\n\nImpact\nMidday reduced invoice reconciliation time by 1–2 man-days per month and made financial visibility much clearer through dashboards.\n\nFavorite features\nClear financial overview, accounts payable tracking, invoice reconciliation, and a clean, intuitive interface.",
  },
  {
    name: "Facu Montanaro",
    title: "",
    company: "Kundo Studio",
    country: "Argentina",
    image: "/stories/facu.jpeg",
    content:
      "Managing invoicing, projects, and finances across tools slowed my daily work. Midday brought everything into one place and made my workflow much simpler.",
    fullContent:
      "Company\nKundo Studio helps startups and founders with fundraising, product launches, and growth through design and meaningful experiences.\n\nChallenge\nManaging invoicing, projects, and finances across multiple tools made daily work slower and more complex. Existing tools felt fragmented and hard to use.\n\nImpact\nMidday centralized invoicing, time tracking, and project information into one place, significantly simplifying day-to-day operations.\n\nFavorite features\nInvoicing and time tracking. Both became core parts of Facu's daily workflow and replaced multiple separate tools.",
  },
  {
    name: "Richard Poelderl",
    title: "",
    company: "Conduct",
    country: "Germany",
    image: "/stories/richard.jpeg",
    content:
      "My previous accounting setup was fragmented and didn't support my bank. Midday made invoicing easier and sharing clean data with my tax advisor straightforward.",
    fullContent:
      "Company\nRichard works with companies that want to focus product development on building great products while outsourcing growth and marketing execution.\n\nChallenge\nHis accounting tool didn't support his bank, required manual formatting of exports, and forced him to juggle multiple financial tools.\n\nImpact\nMidday replaced bank invoicing and made it easier to work with his tax advisor by exporting clean CSV files that integrate with accounting software. This significantly reduced friction while keeping control in one system.\n\nFavorite features\nInvoicing, CSV exports for tax advisors, and bank sync to track subscriptions and expenses.",
  },
  {
    name: "Guy Solan",
    title: "",
    company: "Thetis Medical",
    country: "United Kingdom",
    image: "/stories/guy.jpeg",
    content:
      "Without Midday, I had no real visibility into our cash and relied entirely on my accountant. It gave me clarity without having to learn complex accounting tools.",
    fullContent:
      "Company\nThetis Medical is a medical device company.\n\nChallenge\nWithout Midday, I had no real visibility into our cash and relied entirely on my accountant.\n\nImpact\nMidday gave me clarity without having to learn complex accounting tools.\n\nFavorite features\nFinancial visibility and cash flow tracking.",
    video:
      "https://customer-oh6t55xltlgrfayh.cloudflarestream.com/5b86803383964d52ee6834fd289f4f4e/manifest/video.m3u8",
    videoPoster: "https://cdn.midday.ai/guy-cover.png",
  },
];
