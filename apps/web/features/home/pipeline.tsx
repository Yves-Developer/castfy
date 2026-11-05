"use client";

import {
  EyeOffIcon,
  MicIcon,
  MousePointer2Icon,
  TerminalIcon,
  Volume2Icon,
  ZoomInIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { DotBand } from "./patterns";

/** A word of the sentence, or a tile standing for one of Castfy's tools. */
type Part = string | { icon: ReactNode; color: string; label: string };

const SENTENCE: Part[] = [
  "Castfy opens your app,",
  { icon: <MousePointer2Icon />, color: "bg-brand", label: "Cursor" },
  "clicks through the flow, cuts the dead time,",
  { icon: <ZoomInIcon />, color: "bg-[#7c5cff]", label: "Zoom" },
  "zooms on what matters,",
  { icon: <Volume2Icon />, color: "bg-[#1f9d6b]", label: "Voice" },
  "writes and speaks the voiceover,",
  { icon: <EyeOffIcon />, color: "bg-[#ff5c8a]", label: "Blur" },
  "hides what shouldn't be seen, and exports a finished video. Ask in the app, or let your",
  { icon: <TerminalIcon />, color: "bg-foreground", label: "Agent" },
  "agent run it.",
];

/** Words split out once, so each can light up on its own. */
const WORDS: Part[] = SENTENCE.flatMap((part): Part[] =>
  typeof part === "string" ? part.split(" ") : [part]
);
const WORD_COUNT = WORDS.filter((w) => typeof w === "string").length;

export function HomePipeline() {
  const ref = useRef<HTMLParagraphElement>(null);
  const [lit, setLit] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLit(WORD_COUNT);
      return;
    }
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      const p = (h * 0.85 - r.top) / (r.height + h * 0.3);
      setLit(Math.round(Math.min(1, Math.max(0, p)) * WORD_COUNT));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  let index = 0;
  return (
    <section className="relative py-20 md:py-28" id="how">
      <DotBand className="inset-0" />
      <FloatingCards />
      <p
        className="container relative max-w-200 text-balance text-center text-[26px] leading-[1.5] tracking-[-0.02em] md:text-[36px]"
        ref={ref}
      >
        {WORDS.map((word, i) => {
          if (typeof word !== "string") {
            return (
              <span
                aria-label={word.label}
                className={`mx-1 inline-grid size-8 place-items-center rounded-lg align-[-6px] text-white md:size-9 [&_svg]:size-4 ${word.color}`}
                key={i}
                role="img"
              >
                {word.icon}
              </span>
            );
          }
          const on = index++ < lit;
          return (
            <span
              className={`transition-colors duration-300 ${on ? "text-foreground" : "text-muted-foreground/35"}`}
              key={i}
            >
              {word}{" "}
            </span>
          );
        })}
      </p>
    </section>
  );
}

/** Two pieces of the app floating beside the sentence: a step and a voice line. */
function FloatingCards() {
  return (
    <div aria-hidden className="pointer-events-none max-xl:hidden">
      <div className="absolute top-16 left-[6%] w-60 -rotate-3 rounded-xl border bg-background p-3.5 shadow-[0_20px_50px_-25px_rgba(0,40,90,0.45)]">
        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Step 3 of 7</span>
          <span className="font-mono">0:09</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-brand text-white [&_svg]:size-3.5">
            <MousePointer2Icon />
          </span>
          <div className="flex flex-col">
            <span className="text-sm">Click</span>
            <span className="text-muted-foreground text-xs">Sign in</span>
          </div>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
          <div className="h-full w-[42%] bg-brand" />
        </div>
      </div>
      <div className="absolute right-[5%] bottom-14 w-64 rotate-2 rounded-xl border bg-background p-3.5 shadow-[0_20px_50px_-25px_rgba(0,40,90,0.45)]">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span className="grid size-6 place-items-center rounded-md bg-[#1f9d6b] text-white [&_svg]:size-3">
            <MicIcon />
          </span>
          Aria · voiceover
        </div>
        <p className="mt-2.5 text-sm leading-5">
          &ldquo;Now we sign in with the demo account.&rdquo;
        </p>
        <div className="mt-3 flex h-5 items-end gap-0.5">
          {[
            3, 6, 10, 7, 12, 16, 9, 5, 8, 14, 18, 11, 6, 4, 9, 13, 8, 5, 3, 6,
          ].map((h, i) => (
            <span
              className="w-1 rounded-full bg-[#1f9d6b]"
              key={i}
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
