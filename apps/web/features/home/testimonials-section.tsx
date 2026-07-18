"use client";

import { StarHalfIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { defaultTestimonials } from "@/config/data";
import type { Testimonial } from "@/types";

interface TestimonialsSectionProps {
  customHeader?: ReactNode;
  showStars?: boolean;
  subtitle?: string;
  testimonials?: Testimonial[];
  title?: string;
}

export function TestimonialsSection({
  testimonials = defaultTestimonials,
  title = "Built alongside our users",
  subtitle = "Every feature is shaped by the people who use it every day.",
  showStars = true,
  customHeader,
}: TestimonialsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastDragDistance = useRef(0);
  const [shouldBlockClick, setShouldBlockClick] = useState(false);

  // Scroll to center card on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const centerIndex = Math.floor(testimonials.length / 2);
      const cardWidth =
        scrollContainerRef.current.scrollWidth / testimonials.length;
      scrollContainerRef.current.scrollLeft = centerIndex * cardWidth;
    }
  }, [testimonials.length]);

  return (
    <section>
      {customHeader ? (
        customHeader
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex max-w-3xl flex-col items-center gap-4 text-center">
            <h2 className="font-serif text-2xl text-foreground sm:text-2xl">
              {title}
            </h2>
            <p className="hidden font-sans text-base text-muted-foreground leading-normal sm:block">
              {subtitle}
            </p>
          </div>

          {showStars && (
            <div className="mb-6 flex items-center justify-center sm:mb-10">
              <div className="flex gap-1">
                <StarIcon
                  className="fill-muted-foreground text-muted-foreground"
                  size={16}
                />
                <StarIcon
                  className="fill-muted-foreground text-muted-foreground"
                  size={16}
                />
                <StarIcon
                  className="fill-muted-foreground text-muted-foreground"
                  size={16}
                />
                <StarIcon
                  className="fill-muted-foreground text-muted-foreground"
                  size={16}
                />
                <StarHalfIcon
                  className="fill-muted-foreground text-muted-foreground"
                  size={16}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Testimonials Grid */}
      <div className="mx-auto hidden w-full max-w-5xl justify-center gap-3 lg:flex">
        {testimonials.map((testimonial, index) => {
          const getRotation = () => {
            if (index === 0) {
              return -1;
            }
            if (index === 1) {
              return 1;
            }
            if (index === 2) {
              return 2;
            }
            if (index === 3) {
              return -2;
            }
            return 0;
          };

          return (
            <div
              className="group shrink-0"
              key={`testimonial-${testimonial.name}-${index}`}
              style={{
                transform: `rotate(${getRotation()}deg)`,
              }}
            >
              <div className="flex w-64 flex-col gap-4 rounded-lg border border-border bg-background p-6 transition-all duration-200 hover:border-muted-foreground">
                <div className="flex flex-col gap-3">
                  <p className="text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                    {testimonial.country}
                  </p>
                  <div className="flex items-center gap-2">
                    {testimonial.image ? (
                      <Image
                        alt={testimonial.name}
                        className="h-4 w-4 rounded-full object-cover"
                        height={16}
                        src={testimonial.image}
                        style={{ filter: "grayscale(100%)" }}
                        width={16}
                      />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-muted" />
                    )}
                    <p className="font-sans text-foreground text-sm">
                      {testimonial.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <p className="font-sans text-muted-foreground text-sm">
                    {testimonial.company}
                  </p>
                  <div className="font-sans text-muted-foreground text-sm leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Carousel */}
      <div className="-mx-4 w-screen pl-4 sm:-mx-6 md:-mx-8 lg:hidden">
        <div
          className="relative snap-x snap-mandatory overflow-x-auto overflow-y-visible scroll-smooth py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            // Block clicks if scrolling
            const scrollDistance = Math.abs(
              e.currentTarget.scrollLeft - (lastDragDistance.current || 0)
            );
            if (scrollDistance > 15) {
              setShouldBlockClick(true);
              setTimeout(() => {
                setShouldBlockClick(false);
              }, 300);
            }
            lastDragDistance.current = e.currentTarget.scrollLeft;
          }}
          ref={scrollContainerRef}
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
        >
          <div
            className="flex gap-4 pr-4 pl-4"
            style={{ width: "max-content" }}
          >
            {testimonials.map((testimonial, index) => {
              // Calculate rotation based on position relative to center
              const centerIndex = Math.floor(testimonials.length / 2);
              const offset = index - centerIndex;
              let rotation = 0;
              if (index === 0) {
                rotation = 0; // No rotation for first card
              } else if (offset === -1) {
                rotation = -1;
              } else if (offset === 1) {
                rotation = 1;
              } else if (offset === -2) {
                rotation = -2;
              } else if (offset === 2) {
                rotation = 2;
              }

              return (
                <div
                  className="w-70 shrink-0 snap-start"
                  key={`testimonial-mobile-${testimonial.name}-${index}`}
                >
                  <div
                    className="w-full"
                    style={{
                      pointerEvents: shouldBlockClick ? "none" : "auto",
                      transform:
                        rotation === 0 ? undefined : `rotate(${rotation}deg)`,
                    }}
                  >
                    <div className="flex min-h-60 select-none flex-col gap-4 rounded-lg border border-border bg-background p-8 transition-all duration-200 hover:border-muted-foreground sm:min-h-0 sm:p-6">
                      <div className="flex flex-col gap-3">
                        <p className="text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                          {testimonial.country}
                        </p>
                        <div className="flex items-center gap-2">
                          {testimonial.image ? (
                            <Image
                              alt={testimonial.name}
                              className="h-4 w-4 rounded-full object-cover"
                              height={16}
                              src={testimonial.image}
                              style={{ filter: "grayscale(100%)" }}
                              width={16}
                            />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-muted" />
                          )}
                          <p className="font-sans text-foreground text-sm">
                            {testimonial.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-left">
                        <p className="font-sans text-muted-foreground text-sm">
                          {testimonial.company}
                        </p>
                        <div className="font-sans text-muted-foreground text-sm leading-relaxed">
                          &quot;{testimonial.content}&quot;
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
