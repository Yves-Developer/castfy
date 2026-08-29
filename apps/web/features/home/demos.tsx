"use client";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { demos } from "@/config/data";
export function HomeDemos() {
  return (
    <section className="container flex flex-col gap-10" id="demos">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="max-w-100 text-h2">Generated so far!</h2>

        <Link
          className="flex items-center gap-2 text-muted-foreground text-sm transition-all duration-300 hover:gap-3"
          href={"/contact-sales"}
        >
          <p>Request demo</p>
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <div className="grid w-full max-w-container grid-cols-1 gap-5 md:grid-cols-2">
        {demos.map((s) => (
          <div
            className="relative aspect-video overflow-hidden rounded-lg bg-blue-50"
            key={s.title}
          >
            <video className="size-full" controls muted preload="metadata">
              <source src={s.media} type="video/mp4" />
              <track kind="subtitles" label="English" src="/" srcLang="en" />
              Your browser does not support the video tag.
            </video>
          </div>
        ))}
      </div>
    </section>
  );
}
