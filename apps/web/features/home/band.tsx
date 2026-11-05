import { cn } from "@castfy/ui/lib/utils";
import type { ReactNode } from "react";
import { type EdgeStyle, PanelEdge, Ruler } from "./patterns";

/**
 * Band colours: plain, the soft grey of every other band, and the warm amber
 * of the numbers (the Studio's caption colour). Each has a text colour too,
 * which the band's pattern edge is drawn in.
 */
const TONES = {
  plain: { bg: "", edge: "text-background" },
  soft: {
    bg: "bg-[#f6f8fa] dark:bg-[#14171c]",
    edge: "text-[#f6f8fa] dark:text-[#14171c]",
  },
  amber: {
    bg: "bg-[#fdf5e8] dark:bg-[#231d14]",
    edge: "text-[#f3d9ae] dark:text-[#3a2e1b]",
  },
} as const;

/**
 * One section of the home page: a full-width band with the same space above
 * and below, a line across the top where the page rails get a "+", or a
 * ruler for the first band after the hero. Soft bands are light grey; a band
 * can end in one of Castfy's pattern edges, drawn in its colour, hanging into the next one.
 */
export function Band({
  id,
  soft = false,
  tone,
  ruler = false,
  edge,
  className,
  children,
}: {
  id?: string;
  soft?: boolean;
  /** Overrides `soft`: the band's colour. */
  tone?: keyof typeof TONES;
  ruler?: boolean;
  edge?: EdgeStyle;
  className?: string;
  children: ReactNode;
}) {
  const colour = TONES[tone ?? (soft ? "soft" : "plain")];
  return (
    <section className="relative" id={id}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2",
          !ruler && "border-t",
          colour.bg
        )}
      />
      {ruler ? (
        <div className="relative">
          <Ruler />
        </div>
      ) : (
        <div aria-hidden className="frame relative">
          <span className="absolute -top-2.5 left-0 -translate-x-1/2 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden">
            +
          </span>
          <span className="absolute -top-2.5 right-0 translate-x-1/2 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden">
            +
          </span>
        </div>
      )}
      <div className={cn("page relative py-20 md:py-32", className)}>
        {children}
      </div>
      {edge ? (
        <div
          aria-hidden
          className={cn(
            "absolute bottom-0 left-1/2 z-10 w-screen -translate-x-1/2 translate-y-full",
            colour.edge
          )}
        >
          <PanelEdge style={edge} />
        </div>
      ) : null}
    </section>
  );
}
