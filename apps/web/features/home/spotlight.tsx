import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import type { ReactNode } from "react";
import { type EdgeStyle, PanelEdge } from "./patterns";

/**
 * One part of Castfy given a section of its own: a small label, a heading
 * and a line on the left, an action, then the product on a coloured panel
 * whose bottom edge dissolves into dots, and three details underneath.
 */
export function Spotlight({
  id,
  label,
  icon,
  title,
  text,
  action,
  tint,
  panelClassName,
  children,
  points,
  edge,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  title: string;
  text: string;
  action: { href: string; label: string };
  /** The panel's colour, as a text colour class (the dissolve uses it). */
  tint: string;
  panelClassName?: string;
  children: ReactNode;
  points: { icon: ReactNode; title: string; text: string }[];
  /** How the panel ends: each section gets the one that suits it. */
  edge: EdgeStyle;
}) {
  return (
    <section className="container flex flex-col gap-10" id={id}>
      <div className="flex max-w-xl flex-col items-start gap-4">
        <span className="inline-flex items-center gap-2 text-muted-foreground text-sm [&_svg]:size-4">
          <span
            className={cn(
              "grid size-6 place-items-center rounded-md bg-current [&>svg]:text-foreground",
              tint
            )}
          >
            {icon}
          </span>
          {label}
        </span>
        <h2 className="text-h2">{title}</h2>
        <p className="text-muted-foreground">{text}</p>
        <Button asChild size="sm" variant="outline">
          <a href={action.href}>{action.label}</a>
        </Button>
      </div>

      <div className={tint}>
        <div
          className={cn(
            "relative overflow-hidden rounded-t-2xl bg-current px-4 pt-6 pb-4 md:px-12 md:pt-12 md:pb-8",
            panelClassName
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.55)_1.2px,transparent_1.2px)] [background-size:20px_20px]"
          />
          <div className="relative text-foreground">{children}</div>
        </div>
        <PanelEdge style={edge} />
      </div>

      <div className="grid gap-6 border-t pt-6 md:grid-cols-3">
        {points.map((p) => (
          <div className="flex flex-col gap-1.5" key={p.title}>
            <span className="text-muted-foreground [&_svg]:size-4">
              {p.icon}
            </span>
            <h3 className="font-medium">{p.title}</h3>
            <p className="text-muted-foreground text-sm leading-6">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
