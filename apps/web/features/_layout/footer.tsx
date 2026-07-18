"use client";

import { cn } from "@castfy/ui/lib/utils";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background">
      {/* Top Divider - Full Bleed */}
      <div className="h-px w-full border-border border-t" />

      <div className="mx-auto max-w-350 px-4 py-16 sm:px-8 sm:pb-80">
        {/* Bottom Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <ThemeSwitcher />
          <p className="font-sans text-muted-foreground text-sm">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>

      {/* Large Wordmark */}
      <div className="absolute bottom-0 left-0 translate-y-[25%] overflow-hidden bg-background sm:left-1/2 sm:-translate-x-1/2 sm:translate-y-[40%] sm:transform">
        <h1
          className={cn(
            "select-none font-sans text-[200px] leading-none sm:text-[508px]",
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
