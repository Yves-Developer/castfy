import type { StaticImageData } from "next/image";
import blurShot from "@/public/landing/blur.webp";
import recordShot from "@/public/landing/record.webp";
import studioShot from "@/public/landing/studio.webp";
import voiceShot from "@/public/landing/voice.webp";

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
