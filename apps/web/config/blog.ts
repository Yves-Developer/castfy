import type { StaticImageData } from "next/image";
import excalidrawPoster from "@/public/demos/excalidraw-diagram/poster.webp";
import agentViewShot from "@/public/landing/agent-view.webp";

export interface BlogPost {
  /** The URL: castfy.app/blog/<slug>, and the file content/blog/<slug>.mdx. */
  slug: string;
  /** The phrase people search, as the post's heading. */
  title: string;
  /** About 150 characters: the search result's snippet and the card's text. */
  description: string;
  /** ISO dates. */
  date: string;
  updated?: string;
  author: string;
  tags: string[];
  /** Rounded reading time, from the word count. */
  minutes: number;
  /** For cards and sharing. */
  cover: { src: StaticImageData; alt: string };
  /** Not listed, not built, not in the sitemap: a post still being written. */
  draft?: boolean;
}

/**
 * The blog, newest first. The text is in content/blog/<slug>.mdx; this is
 * what the index, the post's metadata, the sitemap and the RSS feed read, so
 * a post cannot go out half-described.
 */
export const posts: BlogPost[] = [
  {
    slug: "castfy-vs-screen-studio",
    title: "Castfy vs Screen Studio: which should you use for product demos?",
    description:
      "Screen Studio records your screen beautifully; Castfy has your coding agent record it for you. Platforms, price, voice and editing, compared fairly.",
    date: "2026-11-28",
    author: "Yves",
    tags: ["Comparisons"],
    minutes: 5,
    cover: {
      src: excalidrawPoster,
      alt: "A Castfy demo: an architecture diagram drawn in Excalidraw, in a browser window on a macOS wallpaper",
    },
  },
  {
    slug: "claude-code-recorded-a-product-demo",
    title: "I gave Claude Code a URL and it recorded a product demo",
    description:
      "What happens when a coding agent records a product demo: every click it made, what it said, how long it took and what it cost, from real runs.",
    date: "2026-12-07",
    author: "Yves",
    tags: ["Claude Code", "AI agents"],
    minutes: 5,
    cover: {
      src: agentViewShot,
      alt: "Castfy's Agent view: Claude Code's messages and tool calls while it records a demo",
    },
    draft: true,
  },
  {
    slug: "how-to-make-a-product-demo-video",
    title: "How to make a product demo video in 5 minutes",
    description:
      "Make a narrated product demo video from a URL and one sentence, without recording yourself or editing: the steps, the prompt, and a real example.",
    date: "2026-11-28",
    author: "Yves",
    tags: ["Guides", "Demo videos"],
    minutes: 6,
    cover: {
      src: excalidrawPoster,
      alt: "A Castfy demo: an architecture diagram drawn in Excalidraw, in a browser window on a macOS wallpaper",
    },
  },
];

/** What the site shows: everything not marked as a draft. */
export const publishedPosts = posts.filter((p) => !p.draft);

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
