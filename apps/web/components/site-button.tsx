import { cn } from "@castfy/ui/lib/utils";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The site's buttons. Primary is brand blue with a recording dot, the one
 * thing Castfy does, that pulses on hover; outline is white with a thin
 * border. Kept here rather than in @castfy/ui so the apps keep theirs.
 */
const base =
  "group/cta inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand/40 active:translate-y-px";

const variants = {
  primary:
    "bg-brand text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,60,120,0.25)] hover:bg-[#008ae6]",
  outline:
    "border bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-secondary",
  ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
} as const;

const sizes = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
} as const;

/** A small white dot, like a recording light. */
export function RecDot() {
  return (
    <span aria-hidden className="relative grid size-2 place-items-center">
      <span className="absolute inset-0 rounded-full bg-white/70 opacity-0 group-hover/cta:animate-ping group-hover/cta:opacity-100" />
      <span className="relative size-2 rounded-full bg-white" />
    </span>
  );
}

export function SiteButton({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  dot,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  external?: boolean;
  /** Show the recording dot; on by default for primary buttons. */
  dot?: boolean;
  className?: string;
}) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {(dot ?? variant === "primary") ? <RecDot /> : null}
      {children}
    </>
  );
  if (external) {
    return (
      <a className={classes} href={href} rel="noopener" target="_blank">
        {content}
      </a>
    );
  }
  return (
    <Link className={classes} href={href as Route}>
      {content}
    </Link>
  );
}
