import {
  LaptopIcon,
  LayersIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  ScissorsIcon,
  TerminalIcon,
} from "lucide-react";
import { FaGithub, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { FAQItem, PricingTier } from "@/types";
import { siteConfig } from "./site";

/** A demo Castfy made, playing inside the mock editor in the hero. */
export const demoVideoUrl =
  "https://pub-79872054c8cb4a23b5f90577293ece4f.r2.dev/Castfy/demo-with-audio-clean.mp4";

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#journey" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faqs" },
  { label: "Contact", href: "/contact" },
];

/**
 * Axis comparison against the real alternative (hosted demo tools), not the
 * "by hand" strawman the previous page argued with.
 */
export const comparison = [
  {
    axis: "Where your product runs",
    cloud: "Their browser, their infrastructure",
    castfy: "Your machine",
  },
  {
    axis: "Can it reach localhost",
    cloud: "No",
    castfy: "Yes",
  },
  {
    axis: "Staging behind a login",
    cloud: "Hand over access",
    castfy: "Already inside",
  },
  {
    axis: "Price",
    cloud: "$27–250 a month",
    castfy: "$99 once",
  },
];

/**
 * Measured on disk from `edits.json`, 2026-08-30. The 25.3s row is kept
 * deliberately: publishing only the 48x result would be publishing the best day.
 */
export const proof = {
  rows: [
    { label: "Onboarding flow", raw: "396 s", cut: "8.2 s" },
    { label: "Pricing walkthrough", raw: "244 s", cut: "6.3 s" },
    { label: "castfy.app tour", raw: "87.6 s", cut: "9.9 s" },
    { label: "Short settings demo", raw: "25.3 s", cut: "23.4 s" },
  ],
  caveat:
    "That last row is a demo with almost no dead time in it, so almost nothing came out. A tool that only ever showed you the 48x result would be showing you the best day.",
  cost:
    "The castfy.app tour ran on a Claude subscription, so it cost nothing beyond the plan. Priced at API rates instead, the same run would have been about $1.00.",
};

export const pricing: { free: PricingTier; paid: PricingTier } = {
  free: {
    title: "Try it",
    price: "5 demos, free",
    desc: "Full quality. No watermark, no card, no account, no expiry.",
    features: [
      "The full app, every feature",
      "1080p export with no watermark",
      "Runs on the agent subscription you already pay for",
      "No API key to add, no usage bill from me",
    ],
    cta: "Join the waitlist",
  },
  paid: {
    title: "Castfy",
    price: "$99",
    was: "$149",
    desc: "One time. $99 for the waitlist, $149 after launch.",
    features: [
      "Unlimited demos",
      "Everything in the free tier, without the limit",
      "Re-run any flow when your UI changes",
      "A year of updates, and the version you bought keeps working forever",
      "First 100 buyers get updates for life",
    ],
    cta: "Get launch pricing",
    note: "Recordings run on your own Claude, Codex or Cursor subscription. A demo spends quota you already pay for, not money.",
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
      "You need one installed and signed in: Claude Code, Codex, or the Cursor CLI. You do not operate it — Castfy writes the job and runs it headless, so you see a step timeline rather than a chat. It uses that subscription, not an API key.",
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
      "Not yet. It is being built in public, for Windows and macOS. Join the list and you will get launch pricing and the first build.",
  },
];

export const features = [
  {
    icon: LaptopIcon,
    title: "It never leaves your machine",
    description:
      "The browser, the recording, the render and the export all run locally. Nothing is uploaded anywhere.",
  },
  {
    icon: TerminalIcon,
    title: "It reaches what cloud tools can't",
    description:
      "A hosted browser cannot open localhost:3000 on your laptop. This one is already there.",
  },
  {
    icon: MessageSquareIcon,
    title: "You describe it. Nobody records it.",
    description:
      "A URL and a sentence. No re-recording yourself because you said \"um\" at 0:14.",
  },
  {
    icon: RefreshCwIcon,
    title: "Re-run it when the UI moves",
    description:
      "The demo is a prompt, not footage. Ship a redesign, run the same job again.",
  },
  {
    icon: ScissorsIcon,
    title: "The cuts are yours to overrule",
    description:
      "One 88-second recording became 10 seconds of video. Every cut is still editable.",
  },
  {
    icon: LayersIcon,
    title: "214 gradients, 19 overlays, 25 formats",
    description:
      "214 gradients, 90 backgrounds, your own images, 19 shadow overlays, 25 aspect ratios.",
  },
];

/** Roadmap. Approved for public mention as "coming" only — see brand-context.md. */
export const featuresComing =
  "Coming: automatic zoom and pan that follows the cursor.";

export const footerNavs = [
  {
    group: "product",
    categories: [
      {
        title: "Product",
        navs: [
          { label: "How it works", href: "/#journey", external: false },
          { label: "Features", href: "/#features", external: false },
          { label: "Pricing", href: "/#pricing", external: false },
          { label: "FAQ", href: "/#faqs", external: false },
        ],
      },
    ],
  },
  {
    group: "company",
    categories: [
      {
        title: "Company",
        navs: [
          { label: "Contact", href: "/contact", external: false },
          { label: "Waitlist", href: "https://waitlist.castfy.app", external: true },
        ],
      },
    ],
  },
];

export const footerSocialIcons = [
  { icon: FaXTwitter, href: siteConfig.links.x },
  { icon: FaYoutube, href: siteConfig.links.youtube },
  { icon: FaGithub, href: siteConfig.links.github },
];
