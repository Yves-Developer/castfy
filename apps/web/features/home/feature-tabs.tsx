"use client";

import Image from "next/image";
import { useState } from "react";
import blurShot from "@/public/landing/blur.webp";
import changeShot from "@/public/landing/change.webp";
import recordShot from "@/public/landing/record.webp";
import voiceShot from "@/public/landing/voice.webp";
import { PanelEdge } from "./patterns";

/** Screens are from the real app, taken from the hero recording. */
const FEATURES = [
  {
    tab: "Record",
    color: "bg-brand",
    title: "Record with your agent",
    text: "Paste a URL and say what to show. A real browser on your machine works through the flow, signed in, localhost included.",
    image: recordShot,
    alt: "The agent filling in a survey live, its steps listed beside it",
  },
  {
    tab: "Voice",
    color: "bg-[#1f9d6b]",
    title: "A voiceover that sets the pace",
    text: "The agent writes a line per step and the video waits for every word. Nine natural voices, no key needed.",
    image: voiceShot,
    alt: "The voice picker: Aria, Jenny, Emma, Guy, Andrew, Sonia, Ryan, Natasha and Neerja",
  },
  {
    tab: "Blur",
    color: "bg-[#ff5c8a]",
    title: "Hide what shouldn’t be seen",
    text: "Draw a box over an email, a name or a key, and it stays blurred in the export.",
    image: blurShot,
    alt: "A blur box drawn over an answer in the demo",
  },
  {
    tab: "Change something",
    color: "bg-[#12b5cb]",
    title: "Change one thing, keep the rest",
    text: "Type what to change, or @ a step. The agent records a new take; the old one stays in your library.",
    image: changeShot,
    alt: "The agent's steps beside the finished demo",
  },
];

export function FeatureTabs() {
  const [i, setI] = useState(0);
  const f = FEATURES[i];
  return (
    <section className="container" id="features">
      <div className="text-[#eef3f8] dark:text-[#151a21]">
        <div className="rounded-t-2xl bg-current px-4 py-12 md:px-12 md:py-16">
          <div className="flex flex-col gap-8 text-foreground">
            <div className="mx-auto flex max-w-xl flex-col gap-4 text-center">
              <h2 className="text-h2">Everything a demo needs, in one take.</h2>
              <p className="text-muted-foreground">
                Every tool works with the others: record once, then change, blur
                and export without starting over.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2" role="tablist">
              {FEATURES.map((x, k) => (
                <button
                  aria-selected={k === i}
                  className={`inline-flex items-center gap-2 rounded-xl border bg-background px-3.5 py-2 text-sm transition-colors ${k === i ? "border-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  key={x.tab}
                  onClick={() => setI(k)}
                  role="tab"
                  type="button"
                >
                  <span className={`size-4 rounded ${x.color}`} />
                  {x.tab}
                </button>
              ))}
            </div>
            <div
              className="grid items-center gap-8 lg:grid-cols-[1fr_2fr]"
              role="tabpanel"
            >
              <div className="flex flex-col gap-3">
                <h3 className="font-medium text-2xl tracking-[-0.01em]">
                  {f.title}
                </h3>
                <p className="text-muted-foreground leading-7">{f.text}</p>
              </div>
              <div className="relative rounded-2xl border bg-background p-2.5">
                <div className="grid aspect-[1440/876] place-items-center overflow-hidden rounded-lg bg-[#0b0d12]">
                  <Image
                    alt={f.alt}
                    className="size-full object-contain"
                    key={f.tab}
                    placeholder="blur"
                    sizes="(min-width: 1024px) 800px, 100vw"
                    src={f.image}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <PanelEdge style="waveform-ruler" />
      </div>
    </section>
  );
}
