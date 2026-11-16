import type { StaticImageData } from "next/image";
import plausiblePoster from "@/public/demos/plausible-dashboard/poster.webp";

export const DEMO_CATEGORIES = [
  "SaaS",
  "Forms",
  "Dashboards",
  "Behind a login",
  "Localhost",
] as const;

export type DemoCategory = (typeof DEMO_CATEGORIES)[number];

export interface Demo {
  /** The agent that drove the recording. */
  agent: "Claude Code" | "Codex" | "Cursor";
  /** The app the demo is of. */
  app: string;
  /** The app's own site, credited on the page. */
  appUrl: string;
  categories: DemoCategory[];
  description: string;
  /** How long the finished demo is, in seconds. */
  finalSeconds: number;
  /** The video files, under public/. */
  media: { poster: StaticImageData; preview: string; video: string };
  /** What the agent was asked, word for word. */
  prompt: string;
  /** How long the agent's run took, start to end, in seconds. */
  rawSeconds: number;
  slug: string;
  /** Steps the agent took, and how many worked first time. */
  steps: { total: number; succeeded: number };
  title: string;
  /** The page the run started on. */
  url: string;
  voice: string;
}

/**
 * The gallery, newest first. Every demo is a real Castfy recording: the
 * numbers come from the run itself (progress.jsonl, steps.json) and the
 * export, never estimated.
 */
export const demos: Demo[] = [
  {
    slug: "plausible-dashboard",
    app: "Plausible",
    appUrl: "https://plausible.io",
    title: "Reading a traffic dashboard",
    description:
      "Plausible's public live dashboard, narrowed to this week and to visitors from Google, then where they come from.",
    categories: ["Dashboards", "SaaS"],
    agent: "Claude Code",
    voice: "Aria",
    url: "https://plausible.io/plausible.io",
    prompt:
      "On Plausible's live demo dashboard, switch the date range to the last 7 days, filter to visitors from Google, then show which countries they come from. Don't change anything else.",
    rawSeconds: 163,
    finalSeconds: 17.4,
    steps: { total: 8, succeeded: 8 },
    media: {
      poster: plausiblePoster,
      preview: "/demos/plausible-dashboard/preview.mp4",
      video: "/demos/plausible-dashboard/demo.mp4",
    },
  },
];

/** "2.7 min" or "17 s". */
export function formatDuration(seconds: number) {
  return seconds >= 120
    ? `${(seconds / 60).toFixed(1)} min`
    : `${Math.round(seconds)} s`;
}
