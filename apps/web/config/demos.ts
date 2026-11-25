import type { StaticImageData } from "next/image";
import excalidrawPoster from "@/public/demos/excalidraw-diagram/poster.webp";
import orbitosPoster from "@/public/demos/orbitos-tour/poster.webp";
import plausiblePoster from "@/public/demos/plausible-dashboard/poster.webp";

export const DEMO_CATEGORIES = [
  "SaaS",
  "Forms",
  "Dashboards",
  "Diagrams",
  "Behind a login",
  "Localhost",
  "Web apps",
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
  /** Steps the agent took, and how many worked first time, from steps.json. */
  steps?: { total: number; succeeded: number };
  /** The agent's turns, when the steps were not kept (a demo made by a user). */
  turns?: number;
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
    slug: "orbitos-tour",
    app: "OrbitOS",
    appUrl: "https://about.orbitos.lol",
    title: "A tour of a phone OS in the browser",
    description:
      "OrbitOS, a phone-style OS that runs in a browser tab: the home screen, Weather, the app drawer, a game from its store, desktop mode with windows and a taskbar, and its built-in agent.",
    categories: ["Web apps"],
    agent: "Claude Code",
    voice: "Aria",
    url: "https://orbitos.lol",
    prompt:
      "Make a 45–60 second narrated demo of https://orbitos.lol, a phone-style OS that runs in the browser with no install or account. Show: the home screen, open 2–3 apps, launch one of the 39 games, switch to desktop mode (windows + taskbar), and open Orbit Agent. End on \"free, no account, runs in your browser — orbitos.lol\".",
    // The run as the app reported it: 12m 25s and 138 turns. The gallery
    // copy is the export with 7 silent seconds near the end cut out.
    rawSeconds: 745,
    finalSeconds: 73.9,
    turns: 138,
    media: {
      poster: orbitosPoster,
      preview: "/demos/orbitos-tour/preview.mp4",
      video: "/demos/orbitos-tour/demo.mp4",
    },
  },
  {
    slug: "excalidraw-diagram",
    app: "Excalidraw",
    appUrl: "https://excalidraw.com",
    title: "Sketching an app's architecture",
    description:
      "A blank Excalidraw canvas becomes a three-part diagram: browser, API and database, each drawn in one stroke, labelled and joined by arrows.",
    categories: ["Diagrams"],
    agent: "Claude Code",
    voice: "Aria",
    url: "https://excalidraw.com",
    prompt:
      "On Excalidraw, sketch a simple web app architecture: three labelled boxes, Browser, API and Database, joined left to right by arrows.",
    rawSeconds: 43,
    finalSeconds: 30.6,
    steps: { total: 18, succeeded: 18 },
    media: {
      poster: excalidrawPoster,
      preview: "/demos/excalidraw-diagram/preview.mp4",
      video: "/demos/excalidraw-diagram/demo.mp4",
    },
  },
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
    rawSeconds: 20,
    finalSeconds: 16,
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
