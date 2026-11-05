"use client";

import { PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PanelEdge } from "./patterns";

/**
 * The hero: Castfy recorded making a real demo (a Typeform survey), from the
 * prompt to the exported video. It waits on a still of the finished demo
 * until played; the chapter title shows on the stage above the window, and
 * the chapters below follow the playback and jump to their part.
 */
const CHAPTERS = [
  { at: 0, title: "Paste a URL, say what to show" },
  { at: 11.87, title: "Your agent clicks through it, live", speed: "30×" },
  { at: 30.13, title: "Dead time cut, zoom on every click" },
  { at: 35.13, title: "A finished demo, voice in sync" },
  { at: 47.33, title: "Blur what shouldn’t be seen" },
  { at: 52.13, title: "Export on your machine", speed: "20×" },
  { at: 63.93, title: "The result" },
] as const;

function chapterAt(time: number) {
  let index = 0;
  for (let i = 0; i < CHAPTERS.length; i++) {
    if (time >= CHAPTERS[i].at) {
      index = i;
    }
  }
  return index;
}

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) {
      return;
    }
    const onTime = () => {
      const index = chapterAt(el.currentTime);
      const start = CHAPTERS[index].at;
      const end = CHAPTERS[index + 1]?.at ?? el.duration ?? start + 1;
      setCurrent(index);
      setProgress(Math.min(1, (el.currentTime - start) / (end - start || 1)));
    };
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
    };
    const onPause = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, []);

  const jump = (index: number) => {
    const el = video.current;
    if (!el) {
      return;
    }
    el.currentTime = CHAPTERS[index].at + 0.01;
    el.play().catch(() => undefined);
  };

  const toggle = () => {
    const el = video.current;
    if (!el) {
      return;
    }
    if (el.paused) {
      el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  };

  const chapter = CHAPTERS[current];

  return (
    <div className="relative flex flex-col gap-5" id="demo">
      {/* The stage: brand-blue dots lit from behind, the app inset on it. */}
      <div
        className="relative z-10 origin-top text-[#e3f2ff] transition-[scale] duration-75 ease-out [scale:calc(0.9+var(--p,1)*0.1)] dark:text-[#10243a]"
        data-hero-stage
      >
        <div className="relative overflow-hidden rounded-t-2xl bg-current px-3 pt-3 pb-3 md:rounded-t-3xl md:px-14 md:pt-5 md:pb-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(color-mix(in_oklab,var(--color-brand)_35%,transparent)_1.2px,transparent_1.2px)] [background-size:20px_20px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/3 left-1/2 h-2/3 w-3/4 -translate-x-1/2 rounded-full bg-brand/30 blur-[100px]"
          />
          <p
            aria-live="polite"
            className="relative mb-3 text-center font-medium text-base text-foreground tracking-[-0.01em] md:mb-5 md:text-2xl"
          >
            {started
              ? chapter.title
              : "Watch Castfy make a demo, start to finish"}
          </p>
          <div className="relative overflow-hidden rounded-xl border border-black/10 bg-black shadow-[0_30px_80px_-30px_rgba(10,30,70,0.55)]">
            <video
              aria-label="Castfy making a demo of a Typeform survey, from the prompt to the exported video"
              className="block aspect-[1440/876] w-full cursor-pointer"
              loop
              muted
              onClick={toggle}
              playsInline
              poster="/hero/castfy-hero-poster.jpg"
              preload="metadata"
              ref={video}
            >
              <source src="/hero/castfy-hero.mp4" type="video/mp4" />
              <source src="/hero/castfy-hero.webm" type="video/webm" />
            </video>
            {playing ? null : (
              <button
                aria-label="Play the video"
                className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-[0_12px_40px_-8px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 md:size-24"
                onClick={toggle}
                type="button"
              >
                <PlayIcon className="ml-1 size-7 fill-current md:size-10" />
              </button>
            )}
            {playing && "speed" in chapter ? (
              <span className="absolute right-3 bottom-3 rounded-full bg-black/80 px-3 py-1 font-mono text-white text-xs">
                {chapter.speed} speed
              </span>
            ) : null}
          </div>
        </div>
        <PanelEdge style="waveform" />
      </div>

      <ol
        className={
          "relative flex snap-x gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        }
      >
        {CHAPTERS.map((c, i) => (
          <li className="min-w-40 flex-1 snap-start" key={c.title}>
            <button
              aria-current={i === current ? "step" : undefined}
              className="group flex w-full flex-col gap-2 text-left"
              onClick={() => jump(i)}
              type="button"
            >
              <span className="h-0.5 w-full overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full bg-brand transition-[width] duration-200 ease-linear"
                  style={{
                    width:
                      i < current
                        ? "100%"
                        : i === current
                          ? `${progress * 100}%`
                          : "0%",
                  }}
                />
              </span>
              <span className="font-mono text-muted-foreground text-xs">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-sm leading-5 transition-colors ${i === current ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
              >
                {c.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
