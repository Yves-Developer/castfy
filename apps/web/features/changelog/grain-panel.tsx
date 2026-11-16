import { cn } from "@castfy/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * A rounded panel of soft light folds in Castfy blue, like satin or plastic
 * film, under heavy film grain. All CSS: blurred shapes for the folds, two
 * SVG noise tiles for the grain, so it is sharp on every screen and weighs
 * almost nothing. Dark mode deepens the blues.
 */

/** The folds: position, size, angle and colour, light and dark. */
const FOLDS = [
  {
    box: "left-[-5%] top-[5%] h-[45%] w-[55%] -rotate-[18deg]",
    color: "bg-[#6fc0ff] dark:bg-[#2b6fb8]",
  },
  {
    box: "left-[46%] top-[24%] h-[70%] w-[42%] rotate-[36deg]",
    color: "bg-[#3aa6ff] dark:bg-[#1d63b0]",
  },
  {
    box: "left-[58%] top-[38%] h-[62%] w-[20%] rotate-[40deg] opacity-60",
    color: "bg-[#a8dbff] dark:bg-[#4d8fd6] dark:opacity-60",
  },
  {
    box: "left-[-10%] top-[55%] h-[40%] w-[60%] -rotate-[12deg]",
    color: "bg-[#005fc4] dark:bg-[#06204a]",
  },
  {
    box: "left-[65%] top-[-10%] h-[55%] w-[50%] rotate-[20deg]",
    color: "bg-[#0066d6] dark:bg-[#0a2d63]",
  },
  {
    box: "left-[70%] top-[65%] h-[45%] w-[45%]",
    color: "bg-[#003f9e] dark:bg-[#041431]",
  },
  {
    box: "left-[10%] top-[-15%] h-[35%] w-[35%] opacity-70",
    color: "bg-[#5cb6ff] dark:bg-[#3a7cc4] dark:opacity-50",
  },
];

const noise = (frequency: number, octaves: number) =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export function GrainPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[28px] bg-[#0a74d6] dark:bg-[#0a3a78]",
        className
      )}
    >
      <div aria-hidden className="absolute -inset-[20%] blur-[38px]">
        {FOLDS.map((fold) => (
          <span
            className={cn("absolute rounded-full", fold.box, fold.color)}
            key={fold.box}
          />
        ))}
      </div>
      {/* A shade behind the text, so white stays readable on the light folds. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(40%_45%_at_50%_42%,rgba(0,70,170,0.35),transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: noise(0.85, 3) }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 mix-blend-screen dark:opacity-15"
        style={{ backgroundImage: noise(1.6, 1) }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
