"use client";

import { useEffect, useRef, useState } from "react";
import { PlayButton } from "@/components/play-button";
import { GrainPanel } from "@/features/changelog/grain-panel";

/**
 * The hero: Castfy recorded making a real demo (an Excalidraw diagram), from the
 * prompt to the exported video. It waits on a still of the live run
 * until played; the chapter title shows on the stage above the window, and
 * the chapters below follow the playback and jump to their part.
 */
const CHAPTERS = [
  { at: 0, title: "Paste a URL, say what to show" },
  { at: 12.03, title: "Your agent clicks through it, live", speed: "8×" },
  { at: 25.2, title: "Pick a background, the window looks real" },
  { at: 33.97, title: "Dead time cut, calm zoom on every click" },
  { at: 48.57, title: "Export on your machine", speed: "30×" },
  { at: 55.9, title: "The result" },
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
      {/*
        The stage: Castfy's blue satin and grain (as on the changelog and
        demos), the app inset on it. While the page scrolls in, it slides up
        into place and the app follows a beat behind (hero-scroll.tsx).
      */}
      <div
        className="relative z-10 [opacity:calc(0.85+var(--p,1)*0.15)] [translate:0_calc((1-var(--p,1))*140px)]"
        data-hero-stage
      >
        <GrainPanel className="rounded-2xl px-3 pt-3 pb-3 md:rounded-3xl md:px-14 md:pt-5 md:pb-14">
          <p
            aria-live="polite"
            className="relative mb-3 text-center font-medium text-base text-white tracking-[-0.01em] [text-shadow:0_1px_10px_rgba(0,40,110,0.35)] md:mb-5 md:text-2xl"
          >
            {started
              ? chapter.title
              : "Watch Castfy make a demo, start to finish"}
          </p>
          {/* A glass ring around the window, lit from the panel behind it. */}
          <div className="rounded-2xl bg-white/15 p-1.5 shadow-[0_30px_80px_-30px_rgba(10,30,70,0.55),inset_0_1px_0_rgba(255,255,255,0.45)] ring-1 ring-white/35 backdrop-blur-md [translate:0_calc((1-var(--p,1))*56px)] md:rounded-[1.25rem] md:p-2">
            <div className="relative overflow-hidden rounded-xl bg-white">
              <video
                aria-label="Castfy making a demo of an Excalidraw diagram, from the prompt to the exported video"
                className="block aspect-[1440/876] w-full cursor-pointer"
                loop
                muted
                onClick={toggle}
                playsInline
                poster="/hero/castfy-hero-poster.webp"
                preload="metadata"
                ref={video}
              >
                <source src="/hero/castfy-hero.mp4" type="video/mp4" />
                <source src="/hero/castfy-hero.webm" type="video/webm" />
              </video>
              {playing ? null : (
                <PlayButton aria-label="Play the video" onClick={toggle} />
              )}
              {playing && "speed" in chapter ? (
                <span className="absolute right-3 bottom-3 rounded-full bg-black/80 px-3 py-1 font-mono text-white text-xs">
                  {chapter.speed} speed
                </span>
              ) : null}
            </div>
          </div>
        </GrainPanel>
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
