import { cn } from "@castfy/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * Castfy's look, shared with the website (apps/web/features/home/patterns.tsx):
 * a field of dots for empty places, and tool tiles in the Studio's colours.
 */

/** The tool colours, as on the site: one per thing Castfy does. */
export const TOOL = {
  click: "bg-[#0099ff]",
  type: "bg-[#e08a1e]",
  zoom: "bg-[#7c5cff]",
  voice: "bg-[#1f9d6b]",
  blur: "bg-[#ff5c8a]",
  page: "bg-[#12b5cb]",
  agent: "bg-[#2a2d35]",
  neutral: "bg-[#3a3d46]",
} as const;

/** Dots filling the parent, fading at the edges. Decoration only. */
export function DotField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 [background-image:radial-gradient(color-mix(in_oklab,currentColor_34%,transparent)_1px,transparent_1px)] dark:[background-image:radial-gradient(color-mix(in_oklab,currentColor_22%,transparent)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_80%)]",
        className
      )}
    />
  );
}

/** A small square in a tool colour with a white icon on it. */
export function ToolTile({
  color,
  children,
  className,
}: {
  color: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-6 flex-none place-items-center rounded-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] [&_svg]:size-3.5",
        color,
        className
      )}
    >
      {children}
    </span>
  );
}
