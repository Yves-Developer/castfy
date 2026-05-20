"use client";

import {
  AudioLines,
  type LucideProps,
  NotebookPen,
  Sparkle,
} from "lucide-react";
import { motion } from "motion/react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import FeatureCard from "./feature-card";
export interface TFeature {
  description: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
}
export function HomeFeatures() {
  const features: TFeature[] = [
    {
      title: "Record your demo with ease",
      description:
        "Crystal-clear audio capture with automatic transcription. Never worry about missing details again.",
      icon: AudioLines,
    },
    {
      title: "Edit and organize on the fly",
      description:
        "Add highlights, action items, and reminders without interrupting the flow of conversation.",
      icon: NotebookPen,
    },
    {
      title: "Find any demo in seconds",
      description:
        "Search transcripts, replay key moments, and export notes to your team—all in seconds.",
      icon: Sparkle,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="flex flex-col gap-2">
        <h3 className="text-center font-medium text-3xl md:text-4xl">
          Every demo tells story
        </h3>
        <p className="max-w-xl text-center text-muted-foreground text-xl">
          Real-time data that turns link activity into decisions
        </p>
      </div>
      <section className="flex flex-wrap items-stretch justify-center gap-4 max-md:pt-8 md:gap-8">
        {features.map((feature, index) => (
          <motion.div
            className="flex"
            initial={{ opacity: 0, y: 40 }}
            key={feature.title}
            transition={{
              duration: 0.5,
              delay: 0.2 + index * 0.15,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-50px" }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </section>
    </div>
  );
}
