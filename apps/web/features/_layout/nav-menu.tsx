"use client";

import { cn } from "@castfy/ui/lib/utils";
import {
  ChevronDownIcon,
  EyeOffIcon,
  MousePointer2Icon,
  RouteIcon,
  TerminalIcon,
  Volume2Icon,
  ZoomInIcon,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FaDiscord, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { siteConfig } from "@/config/site";

interface Item {
  /** The icon tile's colour: the Studio's tool colours, or the brand's own. */
  color: string;
  external?: boolean;
  href: string;
  icon: ReactNode;
  text: string;
  title: string;
}

type Entry =
  | { label: string; href: string }
  | { label: string; items: Item[]; columns: 1 | 2 };

/** The header's menu: two dropdowns and two plain links. */
const MENU: Entry[] = [
  {
    label: "Product",
    columns: 2,
    items: [
      {
        title: "Record",
        text: "Your agent clicks through your app in a real browser",
        href: "/#features",
        icon: <MousePointer2Icon />,
        color: "bg-brand",
      },
      {
        title: "Studio",
        text: "Dead time cut and a zoom on every click, before you open it",
        href: "/#studio",
        icon: <ZoomInIcon />,
        color: "bg-[#7c5cff]",
      },
      {
        title: "Voice",
        text: "A voiceover the video waits for, in nine voices",
        href: "/#features",
        icon: <Volume2Icon />,
        color: "bg-[#1f9d6b]",
      },
      {
        title: "Blur",
        text: "Hide emails, names and keys in the export",
        href: "/#features",
        icon: <EyeOffIcon />,
        color: "bg-[#ff5c8a]",
      },
      {
        title: "Agents",
        text: "Run Castfy from Claude Code, Codex or Cursor",
        href: "/#agents",
        icon: <TerminalIcon />,
        color: "bg-[#0b0d12]",
      },
      {
        title: "How it works",
        text: "From a URL to a finished demo, in one take",
        href: "/#how",
        icon: <RouteIcon />,
        color: "bg-[#12b5cb]",
      },
    ],
  },
  {
    label: "Community",
    columns: 1,
    items: [
      {
        title: "Discord",
        text: "Talk to the team and the other beta testers",
        href: siteConfig.discordUrl,
        icon: <FaDiscord />,
        color: "bg-[#5865F2]",
        external: true,
      },
      {
        title: "X",
        text: "What's new, as it ships",
        href: siteConfig.links.x,
        icon: <FaXTwitter />,
        color: "bg-[#0b0d12]",
        external: true,
      },
      {
        title: "YouTube",
        text: "Demos made with Castfy",
        href: siteConfig.links.youtube,
        icon: <FaYoutube />,
        color: "bg-[#ff0033]",
        external: true,
      },
    ],
  },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faqs" },
];

const trigger =
  "inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-secondary hover:text-foreground";

/**
 * The centre of the header. A dropdown opens on hover or click and closes
 * when the pointer leaves, on Escape, or when a link in it is followed.
 */
export function NavMenu() {
  const [open, setOpen] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, []);

  const show = (label: string) => {
    clearTimeout(closeTimer.current);
    setOpen(label);
  };
  // A short grace period, so moving the pointer down into the panel works.
  const hide = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(null), 120);
  };

  return (
    <div className="flex items-center gap-0.5" ref={root}>
      {MENU.map((entry) =>
        "href" in entry ? (
          <Link
            className={trigger}
            href={entry.href as Route}
            key={entry.label}
          >
            {entry.label}
          </Link>
        ) : (
          // biome-ignore lint/a11y: hover only opens it sooner; the button inside is what keyboard and touch use
          <div
            className="relative"
            key={entry.label}
            onMouseEnter={() => show(entry.label)}
            onMouseLeave={hide}
          >
            <button
              aria-expanded={open === entry.label}
              aria-haspopup="true"
              className={cn(
                trigger,
                open === entry.label && "bg-secondary text-foreground"
              )}
              onClick={() => setOpen(open === entry.label ? null : entry.label)}
              type="button"
            >
              {entry.label}
              <ChevronDownIcon
                className={cn(
                  "size-3.5 opacity-60 transition-transform",
                  open === entry.label && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "absolute top-full left-1/2 z-50 -translate-x-1/2 pt-3 transition-[opacity,translate] duration-150",
                open === entry.label
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-1 opacity-0"
              )}
            >
              <div
                className={cn(
                  "grid gap-1 rounded-2xl border bg-background p-2.5 shadow-[0_24px_60px_-24px_rgba(0,30,70,0.35)]",
                  entry.columns === 2 ? "w-[34rem] grid-cols-2" : "w-80"
                )}
              >
                {entry.items.map((item) => (
                  <Link
                    className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-secondary"
                    href={item.href as Route}
                    key={item.title}
                    onClick={() => setOpen(null)}
                    rel={item.external ? "noopener" : undefined}
                    target={item.external ? "_blank" : undefined}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-lg text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] [&_svg]:size-4",
                        item.color
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{item.title}</span>
                      <span className="text-muted-foreground text-sm leading-5">
                        {item.text}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
