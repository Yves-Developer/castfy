import { cn } from "@castfy/ui/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The site's buttons: brand blue, white with a thin border, or plain text.
 * An icon can lead (the Apple or Windows mark on a download), and an
 * outbound link can end in an arrow that nudges up and right on hover.
 * Kept here rather than in @castfy/ui so the apps keep theirs.
 */
const base =
  "group/cta inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[10px] font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-brand/40 active:translate-y-px [&_svg]:shrink-0";

const variants = {
  primary:
    "bg-brand text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_1px_2px_rgba(0,60,120,0.25)] hover:bg-[#008ae6]",
  outline:
    "border bg-background text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-secondary",
  ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
  /** Discord's own blurple, for links to the community. */
  discord:
    "bg-[#5865F2] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_1px_2px_rgba(30,40,120,0.3)] hover:bg-[#4752C4]",
} as const;

const sizes = {
  sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
  md: "h-10 px-4 text-sm [&_svg]:size-4",
} as const;

export function SiteButton({
  href,
  children,
  variant = "primary",
  size = "md",
  external = false,
  icon,
  arrow = false,
  download = false,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  external?: boolean;
  /** Shown before the label. */
  icon?: ReactNode;
  /** An arrow after the label, for links that leave the site. */
  arrow?: boolean;
  /** A file download: a plain link the browser follows, no client routing. */
  download?: boolean;
  className?: string;
}) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {icon}
      {children}
      {arrow ? (
        <ArrowUpRightIcon className="-mr-0.5 opacity-60 transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5 group-hover/cta:opacity-100" />
      ) : null}
    </>
  );
  if (external || download) {
    return (
      <a
        className={classes}
        href={href}
        rel={external ? "noopener" : undefined}
        target={external ? "_blank" : undefined}
      >
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
