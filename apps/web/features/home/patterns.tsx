import { cn } from "@castfy/ui/lib/utils";

/**
 * The page's motifs, all drawn from what Castfy makes: the dots of a frame
 * grid, the hatch of a blurred area, a ruler of timecodes, and a voice
 * waveform. Decoration only, hidden from screen readers.
 */

/** A band of dots that fades out at both ends. */
export function DotBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute [background-image:radial-gradient(var(--color-border)_1.2px,transparent_1.2px)] [background-size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]",
        className
      )}
    />
  );
}

/** Oblique hatch, like the blurred box in the Studio. */
export function Hatch({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute [background-image:repeating-linear-gradient(-45deg,var(--color-border)_0_1px,transparent_1px_10px)]",
        className
      )}
    />
  );
}

/**
 * A ruler of timecodes between sections, ticking every second with a label
 * every five, the way the Studio's timeline does.
 */
export function Ruler({ from = 0 }: { from?: number }) {
  const labels = Array.from({ length: 13 }, (_, i) => from + i * 5);
  return (
    <div aria-hidden className="container relative select-none">
      <Cross className="-top-2 left-3 lg:left-7" />
      <Cross className="-top-2 right-3 lg:right-7" />
      <div className="relative h-7 overflow-hidden border-t">
        <div className="absolute inset-x-0 top-0 h-2 [background-image:repeating-linear-gradient(90deg,var(--color-border)_0_1px,transparent_1px_calc(100%/60))]" />
        <div className="absolute inset-x-0 top-0 flex justify-between">
          {labels.map((s) => (
            <span
              className="flex flex-col items-start gap-0.5 font-mono text-[10px] text-muted-foreground/70 max-md:even:hidden"
              key={s}
            >
              <span className="h-3 w-px bg-muted-foreground/40" />
              {`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A "+" where a ruler meets the page rails. */
function Cross({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute z-10 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden",
        className
      )}
    >
      +
    </span>
  );
}

/**
 * Two thin lines down the page at the content's edges, like the margins of a
 * contact sheet. The rulers end on them with a "+".
 */
export function PageRails() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 max-md:hidden"
    >
      <div className="container h-full">
        <div className="h-full border-x" />
      </div>
    </div>
  );
}

/** Bar heights of a spoken line, fixed so the server and browser agree. */
const WAVE = [
  3, 5, 9, 14, 10, 6, 12, 20, 26, 18, 11, 7, 4, 8, 15, 24, 30, 22, 13, 9, 5, 3,
  6, 11, 19, 28, 34, 25, 16, 10, 6, 4, 7, 13, 21, 17, 9, 5, 3, 4, 8, 14, 22, 29,
  20, 12, 7, 4, 3, 6, 10, 17, 25, 31, 23, 15, 9, 5, 3, 5, 9, 16, 12, 7, 4,
];

/** A voice waveform used as the top edge of a dark block. */
export function WaveEdge({ className }: { className?: string }) {
  const bar = 100 / WAVE.length;
  return (
    <svg
      aria-hidden="true"
      className={cn("block h-10 w-full text-foreground", className)}
      preserveAspectRatio="none"
      viewBox="0 0 100 36"
    >
      {WAVE.map((h, i) => (
        <rect
          fill="currentColor"
          height={h + 2}
          key={i}
          rx={0.3}
          width={bar * 0.62}
          x={i * bar + bar * 0.19}
          y={36 - h - 2}
        />
      ))}
    </svg>
  );
}

/** How many dots across the dissolve, and how many rows it falls through. */
const DISSOLVE_COLS = 144;
const DISSOLVE_ROWS = 5;

/** A fixed pseudo-random value per dot, so the server and browser agree. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43_758.5453;
  return x - Math.floor(x);
};

/**
 * The bottom edge of a coloured panel breaking up into dots, the way a frame
 * dissolves: full dots at the top row, fewer and smaller further down. Drawn
 * in currentColor, so it takes the panel's colour.
 */
export function DotDissolve({ className }: { className?: string }) {
  const dots: { x: number; y: number; r: number }[] = [];
  for (let row = 0; row < DISSOLVE_ROWS; row++) {
    for (let col = 0; col < DISSOLVE_COLS; col++) {
      const keep = 1 - (row + 1) / (DISSOLVE_ROWS + 1);
      if (noise(row * DISSOLVE_COLS + col) > keep) {
        continue;
      }
      dots.push({ x: col + 0.5, y: row + 0.5, r: 0.46 - row * 0.05 });
    }
  }
  return (
    <svg
      aria-hidden="true"
      className={cn("block w-full", className)}
      preserveAspectRatio="xMidYMin slice"
      viewBox={`0 0 ${DISSOLVE_COLS} ${DISSOLVE_ROWS}`}
    >
      {dots.map((d) => (
        <circle
          cx={d.x}
          cy={d.y}
          fill="currentColor"
          key={`${d.x}-${d.y}`}
          r={d.r}
        />
      ))}
    </svg>
  );
}

/** The ways a coloured panel can end, all drawn from what Castfy makes. */
export type EdgeStyle =
  | "waveform"
  | "ruler"
  | "waveform-ruler"
  | "hatch"
  | "dots";

/** A voice waveform hanging down from the panel. */
function WaveHang({ className }: { className?: string }) {
  const bar = 100 / WAVE.length;
  return (
    <svg
      aria-hidden="true"
      className={cn("block w-full", className)}
      preserveAspectRatio="none"
      viewBox="0 0 100 36"
    >
      {WAVE.map((h, i) => (
        <rect
          fill="currentColor"
          height={h + 2}
          key={`${i}-${h}`}
          rx={0.4}
          width={bar * 0.62}
          x={i * bar + bar * 0.19}
          y={0}
        />
      ))}
    </svg>
  );
}

/** A strip of timeline ticks in the panel's colour, every second and five. */
function TickStrip({ className }: { className?: string }) {
  return (
    <div className={cn("relative bg-current", className)}>
      <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(90deg,var(--color-foreground)_0_1px,transparent_1px_calc(100%/60))] [background-position:bottom] [background-repeat:no-repeat] [background-size:100%_45%]" />
      <div className="absolute inset-0 opacity-45 [background-image:repeating-linear-gradient(90deg,var(--color-foreground)_0_1px,transparent_1px_calc(100%/12))] [background-position:bottom] [background-repeat:no-repeat] [background-size:100%_80%]" />
    </div>
  );
}

/**
 * The bottom edge of a coloured panel. Drawn in currentColor, so a wrapper's
 * text colour sets it to the panel's colour.
 */
export function PanelEdge({ style }: { style: EdgeStyle }) {
  if (style === "waveform") {
    return <WaveHang className="h-10 md:h-14" />;
  }
  if (style === "ruler") {
    return (
      <div aria-hidden>
        <TickStrip className="h-5 rounded-b-sm" />
        <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground/70">
          {Array.from({ length: 13 }, (_, i) => (
            <span className="max-md:odd:hidden" key={i}>
              {Math.floor((i * 5) / 60)}:{String((i * 5) % 60).padStart(2, "0")}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (style === "waveform-ruler") {
    return (
      <div aria-hidden>
        <TickStrip className="h-2.5" />
        <WaveHang className="h-8 md:h-11" />
      </div>
    );
  }
  if (style === "hatch") {
    return (
      <div
        aria-hidden
        className="h-12 [background-image:repeating-linear-gradient(-45deg,currentColor_0_4px,transparent_4px_12px)] [mask-image:linear-gradient(to_bottom,black,transparent)] md:h-16"
      />
    );
  }
  return <DotDissolve className="h-8 md:h-12" />;
}
