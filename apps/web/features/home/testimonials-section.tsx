"use client";

import { StarHalfIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { defaultTestimonials } from "@/config/data";
import type { Testimonial } from "@/types";

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
  showStars?: boolean;
  customHeader?: ReactNode;
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
        <div className="flex flex-col gap-4 items-center">
          <div className="flex flex-col gap-4 items-center text-center max-w-3xl">
            <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
              {title}
            </h2>
            <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal">
              {subtitle}
            </p>
          </div>

          {showStars && (
            <div className="flex items-center justify-center mb-6 sm:mb-10">
              <div className="flex gap-1">
                <StarIcon
                  className="text-muted-foreground fill-muted-foreground"
                  size={16}
                />
                <StarIcon
                  className="text-muted-foreground fill-muted-foreground"
                  size={16}
                />
                <StarIcon
                  className="text-muted-foreground fill-muted-foreground"
                  size={16}
                />
                <StarIcon
                  className="text-muted-foreground fill-muted-foreground"
                  size={16}
                />
                <StarHalfIcon
                  className="text-muted-foreground fill-muted-foreground"
                  size={16}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop Testimonials Grid */}
      <div className="hidden lg:flex gap-3 w-full max-w-5xl mx-auto justify-center">
        {testimonials.map((testimonial, index) => {
          const getRotation = () => {
            if (index === 0) return -1;
            if (index === 1) return 1;
            if (index === 2) return 2;
            if (index === 3) return -2;
            return 0;
          };

          return (
            <div
              key={`testimonial-${testimonial.name}-${index}`}
              className="shrink-0 group"
              style={{
                transform: `rotate(${getRotation()}deg)`,
              }}
            >
              <div className="bg-background border rounded-lg border-border p-6 w-64 flex flex-col gap-4 transition-all duration-200 hover:border-muted-foreground">
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                    {testimonial.country}
                  </p>
                  <div className="flex gap-2 items-center">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full object-cover"
                        style={{ filter: "grayscale(100%)" }}
                      />
                    ) : (
                      <div className="w-4 h-4 bg-muted rounded-full" />
                    )}
                    <p className="font-sans text-sm text-foreground">
                      {testimonial.name}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <p className="font-sans text-sm text-muted-foreground">
                    {testimonial.company}
                  </p>
                  <div className="font-sans text-sm text-muted-foreground leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Carousel */}
      <div className="lg:hidden w-screen -mx-4 sm:-mx-6 md:-mx-8 pl-4">
        <div
          ref={scrollContainerRef}
          className="relative overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorX: "contain",
          }}
          onScroll={(e) => {
            // Block clicks if scrolling
            const scrollDistance = Math.abs(
              e.currentTarget.scrollLeft - (lastDragDistance.current || 0),
            );
            if (scrollDistance > 15) {
              setShouldBlockClick(true);
              setTimeout(() => {
                setShouldBlockClick(false);
              }, 300);
            }
            lastDragDistance.current = e.currentTarget.scrollLeft;
          }}
        >
          <div
            className="flex gap-4 pl-4 pr-4"
            style={{ width: "max-content" }}
          >
            {testimonials.map((testimonial, index) => {
              // Calculate rotation based on position relative to center
              const centerIndex = Math.floor(testimonials.length / 2);
              const offset = index - centerIndex;
              let rotation = 0;
              if (index === 0)
                rotation = 0; // No rotation for first card
              else if (offset === -1) rotation = -1;
              else if (offset === 1) rotation = 1;
              else if (offset === -2) rotation = -2;
              else if (offset === 2) rotation = 2;

              return (
                <div
                  key={`testimonial-mobile-${testimonial.name}-${index}`}
                  className="w-70 shrink-0 snap-start"
                >
                  <div
                    className="w-full"
                    style={{
                      pointerEvents: shouldBlockClick ? "none" : "auto",
                      transform:
                        rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
                    }}
                  >
                    <div className="bg-background rounded-lg border border-border p-8 sm:p-6 flex flex-col gap-4 select-none hover:border-muted-foreground transition-all duration-200 min-h-60 sm:min-h-0">
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-left">
                          {testimonial.country}
                        </p>
                        <div className="flex gap-2 items-center">
                          {testimonial.image ? (
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              width={16}
                              height={16}
                              className="w-4 h-4 rounded-full object-cover"
                              style={{ filter: "grayscale(100%)" }}
                            />
                          ) : (
                            <div className="w-4 h-4 bg-muted rounded-full" />
                          )}
                          <p className="font-sans text-sm text-foreground">
                            {testimonial.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 text-left">
                        <p className="font-sans text-sm text-muted-foreground">
                          {testimonial.company}
                        </p>
                        <div className="font-sans text-sm text-muted-foreground leading-relaxed">
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
