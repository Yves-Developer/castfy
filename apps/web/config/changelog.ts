import type { StaticImageData } from "next/image";
import agentViewShot from "@/public/landing/agent-view.webp";
import blurShot from "@/public/landing/blur.webp";
import cursorShot from "@/public/landing/cursor.webp";
import recordShot from "@/public/landing/record.webp";
import studioShot from "@/public/landing/studio.webp";
import voiceShot from "@/public/landing/voice.webp";
import windowShot from "@/public/landing/window.webp";

export type ChangeKind = "New" | "Improved" | "Fixed";

export interface ChangelogEntry {
  changes: { kind: ChangeKind; text: string }[];
  /** ISO date of the newest release in the entry. */
  date: string;
  /** The anchor, e.g. "beta-27": castfy.app/changelog#beta-27. */
  id: string;
  image?: { src: StaticImageData; alt: string };
  summary: string;
  title: string;
  /** The release (or releases) the entry covers. */
  version: string;
}

/**
 * The desktop app's releases, newest first, in plain words. Add an entry
 * when a release is published (the same text can go in the GitHub release
 * notes); several small betas can share one.
 */
export const changelog: ChangelogEntry[] = [
  {
    id: "v1-0-2",
    version: "1.0.2",
    date: "2026-11-28",
    title: "Point at a step, and more room to read",
    summary:
      "Ask for a change the way you would in a chat, pointing at the exact step with @, and read the agent's thread with the whole screen.",
    changes: [
      {
        kind: "New",
        text: "Type @ in Change something to pick a step from the list. \"Make @3 slower\" tells the agent exactly which step you mean.",
      },
      {
        kind: "Improved",
        text: "Change something is the same prompt box as your first recording, with the agent, model and voice right under it. Enter sends.",
      },
      {
        kind: "Improved",
        text: "After a recording, the Agent view uses the full height: the player and timeline step aside until you switch back to Video.",
      },
      {
        kind: "Fixed",
        text: "A demo that used less than 1% of your plan's limit no longer says 0%.",
      },
    ],
  },
  {
    id: "v1-0-1",
    version: "1.0.1",
    date: "2026-11-25",
    title: "Watch your agent work, and bring OpenCode",
    summary:
      "See every message and tool call your agent makes while it records, pick its model, see what a demo used of your plan, and record with OpenCode.",
    changes: [
      {
        kind: "New",
        text: "Agent view: switch the studio from the live browser to your agent's own thread, with its messages and every tool call, what it sent and what came back, as it happens. It is kept with the demo, so you can see later why it did something.",
      },
      {
        kind: "New",
        text: "Pick the model your agent records with: Opus, Sonnet or Haiku for Claude Code, or any model you connected in OpenCode.",
      },
      {
        kind: "New",
        text: "What a demo used: the model, turns, time and tokens, the agent's own price for the run, and how much of your Claude plan's 5-hour limit it took.",
      },
      {
        kind: "New",
        text: "OpenCode (experimental): record with OpenCode and the model of your choice, including its free ones. Castfy adds the recorder for the run without touching your OpenCode settings.",
      },
      {
        kind: "Improved",
        text: "Details on a step opens the tool call behind it in the Agent view.",
      },
      {
        kind: "Improved",
        text: "Exports no longer crawl on laptops with less memory: Castfy now picks how many frames to render at once from your memory as well as your processor, instead of filling it and slowing the whole computer down.",
      },
      {
        kind: "Improved",
        text: "The recording browser always runs in the background, and the live view lost its black border.",
      },
      {
        kind: "Fixed",
        text: "When OpenCode's model stops with an error (a used-up free tier, a wrong key), the run ends and tells you why instead of waiting forever.",
      },
    ],
    image: {
      src: agentViewShot,
      alt: "Castfy's Agent view during a recording: the agent's messages and tool calls, one highlighted, with a Stop button below",
    },
  },
  {
    id: "v1-0",
    version: "1.0.0",
    date: "2026-11-17",
    title: "Castfy 1.0: demos that look directed",
    summary:
      "Out of beta. The agent now performs each action once and precisely, the voice flows across the demo, and the cursor looks like your computer's own.",
    changes: [
      {
        kind: "New",
        text: "Your computer's own cursors: the hand over buttons, the text cursor while typing and the crosshair while drawing, taken from macOS or Windows itself.",
      },
      {
        kind: "New",
        text: "Precise drawing and clicking: the agent draws a shape in one smooth stroke, clicks an exact spot and double-clicks, so canvases and editors look natural.",
      },
      {
        kind: "Improved",
        text: "Shorter demos with no dead air: the voice carries on over quick actions instead of freezing the picture, and there is no pause between steps that belong together. Our Excalidraw demo went from 45 to 30 seconds.",
      },
      {
        kind: "Improved",
        text: "The cursor moves like a hand, on a gentle curve, and is a little bigger.",
      },
      {
        kind: "Improved",
        text: "The agent checks its work off camera and plans its shots, so checks, retries and repeated key presses no longer show in the video.",
      },
      {
        kind: "Fixed",
        text: "A video no longer opens on a leftover from an earlier take when the agent tidied up first.",
      },
      {
        kind: "Fixed",
        text: "Typing into a rich editor no longer waits 30 seconds before giving up.",
      },
    ],
    image: {
      src: cursorShot,
      alt: "An Excalidraw diagram being drawn by Castfy, with the macOS hand cursor on the arrow tool",
    },
  },
  {
    id: "beta-28",
    version: "0.1.0-beta.28",
    date: "2026-11-16",
    title: "Your demo in a browser window",
    summary:
      "Demos now play inside a browser window, with the same space all around it and a calmer camera.",
    changes: [
      {
        kind: "New",
        text: "A browser window around the recording, light or dark, with a tab and the page's address. Or no window at all.",
      },
      {
        kind: "New",
        text: "Fit window: the video takes the window's shape, so the space around it is the same on every side.",
      },
      {
        kind: "New",
        text: "Padding: small, medium or large space around the window.",
      },
      {
        kind: "Improved",
        text: "Calm zoom, the new default: it moves in gently only to read what is typed, and the window holds still otherwise. The zoom on every click is still there as Punchy, or turn zoom off.",
      },
      {
        kind: "Improved",
        text: "The Studio preview takes the exact shape of the export, whatever size you pick.",
      },
    ],
    image: {
      src: windowShot,
      alt: "A demo in a light browser window on a blue background, zoomed in gently on an email being typed",
    },
  },
  {
    id: "beta-27",
    version: "0.1.0-beta.27",
    date: "2026-11-15",
    title: "Castfy on Linux, and one simple price",
    summary:
      "Castfy now runs on Linux, and buying it is a single payment, with no subscription.",
    changes: [
      {
        kind: "New",
        text: "Linux: an AppImage for x64, which updates itself like the Mac and Windows apps.",
      },
      {
        kind: "New",
        text: "One payment: $29 for the first 20 buyers, then $49. No subscription.",
      },
      {
        kind: "Improved",
        text: "A clear message when recording needs a beta code or a purchase.",
      },
    ],
  },
  {
    id: "beta-26",
    version: "0.1.0-beta.23 – beta.26",
    date: "2026-11-06",
    title: "Castfy updates itself, with a new look",
    summary:
      "No more downloading each beta: the app now finds and installs new versions on its own.",
    changes: [
      {
        kind: "New",
        text: "Automatic updates: Castfy downloads a new version in the background and installs it when you restart.",
      },
      {
        kind: "Improved",
        text: "The app has Castfy's own look, and light mode is polished throughout.",
      },
      {
        kind: "Improved",
        text: "Faster exports: the render uses every CPU core but one.",
      },
      {
        kind: "Improved",
        text: "The voice you pick is remembered for your next demo.",
      },
      {
        kind: "Fixed",
        text: "Export no longer clashes with a dev server running on the same port.",
      },
      {
        kind: "Fixed",
        text: "The blur preview matches what the export hides.",
      },
    ],
    image: {
      src: studioShot,
      alt: "The Castfy Studio with a finished demo on the timeline",
    },
  },
  {
    id: "beta-22",
    version: "0.1.0-beta.20 – beta.22",
    date: "2026-11-04",
    title: "Blur, re-takes and accounts",
    summary:
      "Hide what shouldn't be seen, fix one part without recording it all again, and sign in to Castfy.",
    changes: [
      {
        kind: "New",
        text: "Blur boxes in the Studio: hide emails, names and API keys in the export.",
      },
      {
        kind: "New",
        text: "Change something: tell the agent what to do differently and re-record just that take.",
      },
      {
        kind: "New",
        text: "Sign in with Google, and enter a beta code to unlock Castfy.",
      },
      {
        kind: "New",
        text: "When a site asks for a code (a sign-in email, a 2FA code), the agent asks you for it in the steps panel.",
      },
      {
        kind: "Improved",
        text: "The Mac app is signed and notarized, so macOS opens it without a warning.",
      },
      {
        kind: "Improved",
        text: "A smoother zoom camera, in the preview and in the export.",
      },
      {
        kind: "Fixed",
        text: "Export progress stays when you leave the Studio, and a run that recorded nothing says so.",
      },
    ],
    image: {
      src: blurShot,
      alt: "A blur box over private details in the Castfy Studio",
    },
  },
  {
    id: "beta-19",
    version: "0.1.0-beta.14 – beta.19",
    date: "2026-10-23",
    title: "A voiceover for every demo",
    summary:
      "Pick a voice before recording, and the finished demo narrates what happens on screen.",
    changes: [
      {
        kind: "New",
        text: "Choose a voiceover when you start a recording.",
      },
      {
        kind: "New",
        text: "See what a run used, and save the export wherever you want.",
      },
      {
        kind: "Improved",
        text: "Calmer zooms you can remove one by one, on an editor-style timeline.",
      },
      {
        kind: "Fixed",
        text: "The preview's voice stays in sync with the video and no longer repeats words.",
      },
      {
        kind: "Fixed",
        text: "On Windows, Castfy shows Claude Code as connected once it is.",
      },
    ],
    image: {
      src: voiceShot,
      alt: "Choosing a voice for the demo in Castfy",
    },
  },
  {
    id: "beta-13",
    version: "0.1.0-beta.1 – beta.13",
    date: "2026-10-19",
    title: "The first beta",
    summary:
      "Paste a URL, say what to show, and your coding agent records it in a real browser on your machine.",
    changes: [
      {
        kind: "New",
        text: "Castfy's first builds for macOS and Windows: record, edit in the Studio and export an MP4.",
      },
      {
        kind: "New",
        text: "The agent's steps appear live while it clicks through your app.",
      },
      {
        kind: "Fixed",
        text: "Exports work on macOS 12 to 14.",
      },
    ],
    image: {
      src: recordShot,
      alt: "Starting a recording in Castfy with a URL and a prompt",
    },
  },
];

/** "Nov 15, 2026", the same on the server and in the browser. */
export function formatChangelogDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
