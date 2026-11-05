"use client";

import { type ReactNode, useEffect, useRef } from "react";

/**
 * "Zoom on the click": while the page scrolls from the top until the video's
 * stage reaches the header, the headline stays put and fades out, the side
 * cards drift away, and the stage grows to full size, the way Castfy's
 * camera moves into a click. After that the page scrolls as usual.
 *
 * Progress is written to the --p CSS variable (0 to 1) on the section; the
 * parts read it in their styles. Wide screens only, and never for people
 * who asked for less motion: there --p stays unset and nothing moves.
 */
export function HeroScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = ref.current;
    if (!section) {
      return;
    }
    const wide = window.matchMedia("(min-width: 1024px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let distance = 1;
    let frame = 0;

    const measure = () => {
      const stage = section.querySelector<HTMLElement>("[data-hero-stage]");
      if (!stage) {
        return;
      }
      // Where the stage starts, in page terms, less the header's height.
      const top = stage.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, top - 96);
    };
    const update = () => {
      frame = 0;
      if (!wide.matches || calm.matches) {
        section.style.removeProperty("--p");
        section.dataset.moving = "false";
        return;
      }
      const p = Math.min(1, Math.max(0, window.scrollY / distance));
      section.style.setProperty("--p", p.toFixed(4));
      section.dataset.moving = "true";
    };
    const onScroll = () => {
      if (!frame) {
        frame = requestAnimationFrame(update);
      }
    };
    const onResize = () => {
      section.style.removeProperty("--p");
      measure();
      update();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    wide.addEventListener("change", onResize);
    calm.addEventListener("change", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      wide.removeEventListener("change", onResize);
      calm.removeEventListener("change", onResize);
    };
  }, []);

  return (
    <section
      className="group/hero page flex flex-col gap-16 pt-20 pb-20 md:pt-24 md:pb-32"
      id="hero"
      ref={ref}
    >
      {children}
    </section>
  );
}
