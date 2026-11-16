"use client";

import { cn } from "@castfy/ui/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  DEMO_CATEGORIES,
  type Demo,
  type DemoCategory,
  formatDuration,
} from "@/config/demos";

/** The gallery: a row of filters, then a card per demo. */
export function DemoGrid({ demos }: { demos: Demo[] }) {
  const [filter, setFilter] = useState<DemoCategory | "All">("All");
  const shown =
    filter === "All"
      ? demos
      : demos.filter((d) => d.categories.includes(filter));
  // Only the kinds there are demos of: an empty filter is a dead end.
  const used = DEMO_CATEGORIES.filter((c) =>
    demos.some((d) => d.categories.includes(c))
  );
  const chips: (DemoCategory | "All")[] = ["All", ...used];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            aria-pressed={filter === chip}
            className={cn(
              "h-8 rounded-full border px-3.5 font-medium text-[13px] transition-colors",
              filter === chip
                ? "border-transparent bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
            key={chip}
            onClick={() => setFilter(chip)}
            type="button"
          >
            {chip}
          </button>
        ))}
      </div>
      <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((demo) => (
          <li key={demo.slug}>
            <DemoCard demo={demo} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One demo: its still, which plays the video silently on hover; the app,
 * the title, and what the run took. The video only loads on the first hover.
 */
function DemoCard({ demo }: { demo: Demo }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const el = video.current;
    if (!el) {
      return;
    }
    if (!el.src) {
      el.src = demo.media.preview;
    }
    el.play()
      .then(() => setPlaying(true))
      .catch(() => undefined);
  };
  const stop = () => {
    video.current?.pause();
    setPlaying(false);
  };

  return (
    <Link
      className="group flex flex-col gap-4"
      href={`/demos/${demo.slug}`}
      onBlur={stop}
      onFocus={start}
      onMouseEnter={start}
      onMouseLeave={stop}
    >
      <div
        className="relative overflow-hidden rounded-xl border bg-secondary shadow-[0_24px_50px_-34px_rgba(0,40,90,0.55)] transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{
          aspectRatio: `${demo.media.poster.width} / ${demo.media.poster.height}`,
        }}
      >
        <Image
          alt=""
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-300",
            playing && "opacity-0"
          )}
          placeholder="blur"
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          src={demo.media.poster}
        />
        <video
          aria-hidden
          className="absolute inset-0 size-full object-cover"
          loop
          muted
          playsInline
          preload="none"
          ref={video}
        />
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur">
          {formatDuration(demo.rawSeconds)} →{" "}
          {formatDuration(demo.finalSeconds)}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-sm">{demo.app}</span>
        <span className="font-medium text-lg leading-6 tracking-[-0.01em] group-hover:underline group-hover:underline-offset-4">
          {demo.title}
        </span>
        <span className="text-muted-foreground text-sm leading-6">
          {demo.description}
        </span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {[demo.agent, demo.voice, ...demo.categories].map((t) => (
            <span
              className="rounded-md bg-secondary px-2 py-0.5 text-muted-foreground text-xs"
              key={t}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
