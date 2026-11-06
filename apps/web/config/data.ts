import type { FAQItem, PricingTier } from "@/types";
import { siteConfig } from "./site";

export const navLinks = [
  { label: "How it works", href: "/#how" },
  { label: "Studio", href: "/#studio" },
  { label: "Agents", href: "/#agents" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faqs" },
];

/**
 * Real runs of Castfy beta.25 with Claude Code and a voiceover, 2026-11-06:
 * how long the agent worked (run-usage.json) against the finished demo
 * (demo.mp4). Castfy records only the steps, so the waiting never makes it
 * into the video. The 2.5x tour is kept deliberately: publishing only the
 * best rows would be publishing the best day.
 */
export const proof = {
  rows: [
    { label: "Typeform survey, filled in", raw: "459 s", cut: "99.5 s" },
    { label: "Pricing walkthrough", raw: "187 s", cut: "39.0 s" },
    { label: "One FAQ answer", raw: "70.8 s", cut: "19.0 s" },
    { label: "castfy.app tour", raw: "110 s", cut: "43.8 s" },
  ],
  caveat:
    "Every run came out shorter. The castfy.app tour the least, 2.5x, because the agent barely waited and every step has a line to speak. We show it anyway.",
  cost: "On your Claude subscription, these cost nothing extra. At API rates: $1.67 for the survey, under $0.80 for each of the others.",
};

export const pricing: { free: PricingTier; paid: PricingTier } = {
  free: {
    title: "Try it",
    price: "Free",
    unit: "5 demos",
    desc: "No watermark, no card, no expiry. Sign in with Google to start.",
    features: [
      "The full app, every feature",
      "1080p export with no watermark",
      "Runs on the agent subscription you already pay for",
      "No API key to add, no usage bill from me",
    ],
    cta: "Download free",
  },
  paid: {
    title: "Castfy",
    badge: "Launch price",
    price: "$99",
    unit: "once",
    was: "$149",
    desc: "One time. $99 at launch, $149 after.",
    features: [
      "Unlimited demos",
      "Everything in the free tier, without the limit",
      "Re-run any flow when your UI changes",
      "A year of updates, and the version you bought keeps working forever",
    ],
    cta: "Join the beta",
    note: "Free during the private beta: testers get a beta code for unlimited demos. Recordings run on your own Claude, Codex or Cursor subscription, so a demo spends quota you already pay for, not money.",
  },
};

/** Verified 2026-08-31. Re-check before publishing; a wrong competitor price gets screenshotted. */
export const pricingKicker =
  "Demosmith's Pro plan is $99 a month. This is $99.";

export const faqs: FAQItem[] = [
  {
    question: "What is Castfy?",
    answer:
      "A desktop app that turns a URL and a prompt into a product demo video. You say which page and what to show; it drives a real browser on your machine and records the flow. The dead time comes out automatically, and the narration is written from what actually happened on screen.",
  },
  {
    question: "Do I need a coding agent?",
    answer:
      "You need one installed and signed in. Claude Code is the one Castfy is tested with and recommended; Codex and the Cursor CLI work too, but are still experimental. You do not operate it — Castfy writes the job and runs it headless, so you see a step timeline rather than a chat. It uses that subscription, not an API key.",
  },
  {
    question: "How is this different from a hosted demo tool?",
    answer:
      "The good ones also generate a demo from a URL and a prompt, and they run your product in a browser on their infrastructure. Castfy runs it on yours. That is the whole difference, and it decides whether the tool can reach localhost or an app behind your login at all.",
  },
  {
    question: "Can it record localhost or an app behind a login?",
    answer:
      "Yes. The browser is already on your machine and uses a real session, so localhost, staging, internal tools, and authenticated flows all work without giving a third party access to any of them.",
  },
  {
    question: "What does it cost to run?",
    answer:
      "Nothing beyond your existing agent plan. A demo spends the quota you already pay for, not money, and there is no API key to add. If you hit your agent's usage limit it resets with your subscription.",
  },
  {
    question: "What happens after the year of updates?",
    answer:
      "Nothing stops working. You keep the version you bought, permanently. If you want another year of updates there will be an optional renewal, cheaper than the first year, and skipping it costs you nothing you already have.",
  },
  {
    question: "What comes out at the end?",
    answer:
      "An MP4 written to your disk. You also get the project behind it, so the cuts, the background and the narration are all still editable before you export.",
  },
  {
    question: "What happens when my UI changes?",
    answer:
      "Run the same job again. The demo is a prompt rather than footage, so a redesign means re-running it rather than re-recording it, and nobody walks the flow a second time.",
  },
  {
    question: "Is it available yet?",
    answer:
      "The private beta opens on November 10, for macOS and Windows. Everyone on the waitlist gets the first build and a personal beta code, which makes Castfy free and unlimited for the beta. Join the list to be included.",
  },
];

/** The footer's link columns. */
export const footerNavs: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Studio", href: "/#studio" },
      { label: "Agents", href: "/#agents" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faqs" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: siteConfig.discordUrl, external: true },
      { label: "X", href: siteConfig.links.x, external: true },
      { label: "YouTube", href: siteConfig.links.youtube, external: true },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Join beta", href: siteConfig.waitlistUrl, external: true },
      { label: "Releases", href: siteConfig.releasesUrl, external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refunds", href: "/refund" },
    ],
  },
];
