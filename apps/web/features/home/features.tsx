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
      title: "Record your calls with ease",
      description:
        "Crystal-clear audio capture with automatic transcription. Never worry about missing details again.",
      icon: AudioLines,
    },
    {
      title: "Take notes as you talk",
      description:
        "Add highlights, action items, and reminders without interrupting the flow of conversation.",
      icon: NotebookPen,
    },
    {
      title: "Find any call in seconds",
      description:
        "Search transcripts, replay key moments, and export notes to your team—all in seconds.",
      icon: Sparkle,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4">
      <motion.h1
        className="text-center font-aleo 4xl:text-6xl text-3xl md:text-4xl"
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        One app for all your conversations
      </motion.h1>
      <motion.p
        className="4xl:max-w-6xl max-w-2xl text-center 4xl:text-3xl text-lg text-muted-foreground"
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
        whileInView={{ opacity: 1, y: 0 }}
      >
        Whether it&apos;s client meetings, interviews, or team calls—capture,
        organize, and review every conversation in one place.
      </motion.p>
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
