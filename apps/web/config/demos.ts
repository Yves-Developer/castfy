import type { StaticImageData } from "next/image";
import excalidrawPoster from "@/public/demos/excalidraw-diagram/poster.webp";
import orbitosPoster from "@/public/demos/orbitos-tour/poster.webp";
import termioPoster from "@/public/demos/termio-tour/poster.webp";
import planePoster from "@/public/demos/plane-board/poster.webp";
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
  /** How long the agent's run took, start to end, in seconds; absent when not reported. */
  rawSeconds?: number;
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
    slug: "plane-board",
    app: "Plane",
    appUrl: "https://plane.so",
    title: "Signing in and planning work on a board",
    description:
      "Plane, the open-source project tool, from its sign-in page: an email code typed as a secret, then a new work item set to High priority, assigned, and dragged into In Progress.",
    categories: ["Behind a login", "SaaS"],
    agent: "Claude Code",
    voice: "Emma",
    url: "https://app.plane.so/",
    prompt:
      'Show how a team plans work in Plane, starting from the sign-in. Sign in on camera: choose to continue with email, use castfy0_ask_user to ask me for my email address and type it in, and if Plane sends a code or asks for a password, ask me for it with castfy0_ask_user and type it with secret: true. Then, in the Acme workspace\'s Product project: create a new work item called "Add dark mode to settings", set its priority to High, assign it to me, and move it to In Progress. End on the board view showing it next to the others.',
    // The run as the app reported it: Opus, 15m 1s, 158 turns. The email
    // is blurred in this copy.
    rawSeconds: 901,
    finalSeconds: 59,
    turns: 158,
    media: {
      poster: planePoster,
      preview: "/demos/plane-board/preview.mp4",
      video: "/demos/plane-board/demo.mp4",
    },
  },
  {
    slug: "termio-tour",
    app: "Termio",
    appUrl: "https://about.termio.lol",
    title: "Booting real operating systems in a browser tab",
    description:
      "Termio, a full 32-bit PC that runs in the browser: its library of systems, FreeDOS booting in an instant, a Linux shell answering uname -a, and the ReactOS desktop.",
    categories: ["Web apps"],
    agent: "Claude Code",
    voice: "Aria",
    url: "https://termio.lol",
    prompt:
      'Make a 45–60 second narrated demo of Termio, a full 32-bit PC that runs in the browser and boots real operating systems, with no install or account. Show: the system library, start FreeDOS (it boots almost instantly), then start Buildroot Linux, wait for the shell, and type `uname -a` so its answer shows. Then open the ReactOS desktop. Keep loading and boot waits out of the video. End on "real operating systems, in a browser tab — termio.lol".',
    // Made by a user, who sent the export: the run's time and turns were not kept.
    finalSeconds: 67.9,
    media: {
      poster: termioPoster,
      preview: "/demos/termio-tour/preview.mp4",
      video: "/demos/termio-tour/demo.mp4",
    },
  },
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
      'Make a 45–60 second narrated demo of https://orbitos.lol, a phone-style OS that runs in the browser with no install or account. Show: the home screen, open 2–3 apps, launch one of the 39 games, switch to desktop mode (windows + taskbar), and open Orbit Agent. End on "free, no account, runs in your browser — orbitos.lol".',
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
