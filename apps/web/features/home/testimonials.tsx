"use client";

import { Button } from "@workspace/ui/components/button";
import { ArrowUpRightIcon } from "lucide-react";
import { InfiniteSlider } from "@/components/infinite-slider";
import { testimonials } from "@/config/data";
import { siteConfig } from "@/config/site";

export function HomeTestimonials() {
  const firstRow = testimonials.slice(0, testimonials.length / 2);
  const secondRow = testimonials.slice(testimonials.length / 2);
  return (
    <section className="w-full space-y-10" id="testimonials">
      <div className="flex flex-col items-center gap-4 text-center">
        <h3 className="text-balance font-medium text-3xl leading-6 md:text-4xl">
          Meet {siteConfig.name} users
        </h3>
        <p className="text-muted-foreground text-sm md:text-base">
          {siteConfig.name} empowers thousands of people to record beautiful
          videos and demos of their products and services.
        </p>
        <Button asChild className="rounded-full" variant={"secondary"}>
          <a
            href="https://g.page/r/CfkOnGc9WV-sEAE/review"
            rel="noopener"
            target="_blank"
          >
            Give us a review
          </a>
        </Button>
      </div>

      <InfiniteSlider gap={20} speed={20} speedOnHover={5}>
        {firstRow.map((t, i) => (
          <a
            className="group relative flex w-full max-w-xs flex-col justify-between rounded-lg *:px-4 hover:cursor-pointer hover:bg-secondary *:md:px-6"
            href={t.source.link}
            key={`${t.content}-${i}`}
            rel="noopener"
            target="_blank"
          >
            <blockquote className="flex-1 py-4">
              <p className="line-clamp-3 text-foreground text-sm tracking-tight">
                {t.content}
              </p>
            </blockquote>
            <figcaption className="flex h-16 items-center justify-between gap-4">
              <div className="flex flex-col py-2">
                <cite className="text-nowrap font-medium text-sm not-italic leading-5 tracking-tight">
                  {t.name}
                </cite>
                <span className="text-muted-foreground text-xs leading-5 tracking-tight">
                  {t.source.label}
                </span>
              </div>
              <ArrowUpRightIcon className="size-4 opacity-0 transition-all duration-250 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
            </figcaption>
          </a>
        ))}
      </InfiniteSlider>
      <InfiniteSlider gap={20} reverse speed={20} speedOnHover={5}>
        {secondRow.map((t, i) => (
          <a
            className="group relative flex w-full max-w-xs flex-col justify-between rounded-lg *:px-4 hover:cursor-pointer hover:bg-secondary *:md:px-6"
            href={t.source.link}
            key={`${t.content}-${i}`}
            rel="noopener"
            target="_blank"
          >
            <blockquote className="flex-1 py-4">
              <p className="line-clamp-3 text-foreground text-sm tracking-tight">
                {t.content}
              </p>
            </blockquote>
            <figcaption className="flex h-16 items-center justify-between">
              <div className="flex flex-col py-2">
                <cite className="text-nowrap font-medium text-sm capitalize not-italic leading-5 tracking-tight">
                  {t.name}
                </cite>
                <span className="text-muted-foreground text-xs leading-5 tracking-tight">
                  {t.source.label}
                </span>
              </div>
              <ArrowUpRightIcon className="size-4 opacity-0 transition-all duration-250 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100" />
            </figcaption>
          </a>
        ))}
      </InfiniteSlider>
    </section>
  );
}
