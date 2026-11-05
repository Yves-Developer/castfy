import { cn } from "@castfy/ui/lib/utils";
import { ArrowUpRightIcon, MousePointer2Icon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { footerNavs } from "@/config/data";
import { siteConfig } from "@/config/site";
import FooterDate from "./footer-date";

/** A "+" where a line across the footer meets the rails. */
function Crosses() {
  return (
    <div aria-hidden className="frame relative">
      <span className="absolute -top-2.5 left-0 -translate-x-1/2 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden">
        +
      </span>
      <span className="absolute -top-2.5 right-0 translate-x-1/2 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden">
        +
      </span>
    </div>
  );
}

/**
 * The footer, inside the same rails as the page: Castfy with its two
 * buttons, the link columns, the year and theme, and the name drawn large
 * in outline, as before.
 */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("relative overflow-hidden", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="frame h-full border-x" />
      </div>

      <div className="page relative grid gap-12 py-16 md:py-20 lg:grid-cols-[1.1fr_2fr]">
        <div className="flex flex-col items-start gap-5">
          <Link className="flex items-center gap-2" href="/">
            <MousePointer2Icon className="size-6 rotate-90 fill-foreground" />
            <span className="font-medium text-lg">{siteConfig.name}</span>
          </Link>
          <p className="max-w-xs text-muted-foreground leading-6">
            Turn a URL into a narrated product demo, recorded on your own
            machine by the agent you already use.
          </p>
          <div className="flex flex-wrap gap-2">
            <DownloadButton size="sm" />
            <SiteButton
              arrow
              external
              href={siteConfig.waitlistUrl}
              size="sm"
              variant="outline"
            >
              Join beta
            </SiteButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {footerNavs.map((column) => (
            <div className="flex flex-col gap-3" key={column.title}>
              <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                {column.title}
              </span>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="group/link inline-flex items-center gap-1 text-foreground/80 text-sm transition-colors hover:text-foreground"
                      href={link.href as Route}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      target={link.external ? "_blank" : undefined}
                    >
                      {link.label}
                      {link.external ? (
                        <ArrowUpRightIcon className="size-3 opacity-50 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="relative border-t">
        <Crosses />
        <div className="page flex flex-wrap items-center justify-between gap-3 py-5">
          <Suspense>
            <FooterDate />
          </Suspense>
          <ThemeSwitcher />
        </div>
      </div>

      <div className="overflow-hidden sm:transform">
        <h1
          className={cn(
            "-mb-60 select-none text-[200px] leading-none sm:text-[508px]",
            "text-secondary",
            "[WebkitTextStroke:1px_var(--muted-foreground)]",
            "[textStroke:1px_var(--muted-foreground)]"
          )}
          style={{
            WebkitTextStroke: "1px var(--muted-foreground)",
            color: "var(--secondary)",
          }}
        >
          {siteConfig.name}
        </h1>
      </div>
    </footer>
  );
}
