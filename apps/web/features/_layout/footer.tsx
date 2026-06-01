"use client";

import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-background">
      {/* Top Divider - Full Bleed */}
      <div className="h-px w-full border-border border-t" />

      <div className="mx-auto max-w-350 px-4 py-16 sm:px-8 sm:pb-80">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Links */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12 md:grid-cols-5 lg:col-span-1">
            {/* Features Column */}
            <div className="space-y-3">
              <h3 className="mb-4 font-sans text-foreground text-sm">
                Features
              </h3>
              <div className="space-y-2.5">
                {[
                  { href: "/invoicing", label: "Invoicing" },
                  { href: "/inbox", label: "Inbox" },
                  { href: "/time-tracking", label: "Time tracking" },
                  { href: "/customers", label: "Customers" },
                  { href: "/file-storage", label: "Files" },
                  { href: "/pre-accounting", label: "Exports" },
                ].map((item) => (
                  <Link
                    className="block font-sans text-muted-foreground text-sm transition-colors hover:text-foreground"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Product Column */}
            <div className="space-y-3">
              <h3 className="mb-4 font-sans text-foreground text-sm">
                Product
              </h3>
              <div className="space-y-2.5">
                {[
                  { href: "/download", label: "Download" },
                  { href: "/pre-accounting", label: "Pre-accounting" },
                  { href: "/integrations", label: "Apps & Integrations" },
                  { href: "/testimonials", label: "Customer Stories" },
                ].map((item) => (
                  <Link
                    className="block font-sans text-muted-foreground text-sm transition-colors hover:text-foreground"
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Company Column */}
            <div className="space-y-3">
              <h3 className="mb-4 font-sans text-foreground text-sm">
                Company
              </h3>
              <div className="space-y-2.5">
                {[
                  { href: "/story", label: "Story", external: false },
                  { href: "/updates", label: "Updates", external: false },
                  {
                    href: "https://x.com/middayai",
                    label: "X / Twitter",
                    external: true,
                  },
                  {
                    href: "https://www.linkedin.com/company/midday-ai",
                    label: "LinkedIn",
                    external: true,
                  },
                ].map((item) => (
                  <Link
                    className="block font-sans text-muted-foreground text-sm transition-colors hover:text-foreground"
                    href={item.href}
                    key={item.href}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    target={item.external ? "_blank" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h3 className="mb-4 font-sans text-foreground text-sm">
                Resources
              </h3>
              <div className="space-y-2.5">
                {[
                  { href: "/chat", label: "Chat", external: false },
                  { href: "/docs", label: "Documentation", external: false },
                  { href: "/support", label: "Support", external: false },
                  {
                    href: "/policy",
                    label: "Privacy Policy",
                    external: false,
                  },
                  {
                    href: "/terms",
                    label: "Terms of Service",
                    external: false,
                  },
                ].map((item) => (
                  <Link
                    className="block font-sans text-muted-foreground text-sm transition-colors hover:text-foreground"
                    href={item.href}
                    key={item.href}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    target={item.external ? "_blank" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Tagline & Compliance */}
          <div className="flex flex-col items-start gap-6 lg:items-end lg:gap-10">
            <p className="text-left font-sans text-base text-foreground sm:text-xl lg:text-right">
              Get demo in minutes.
            </p>

            {/* Theme Toggle */}
            <ThemeSwitcher />
          </div>
        </div>

        {/* Divider */}
        <div className="my-16">
          <div className="h-px w-full border-border border-t" />
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link
            className="hidden items-center gap-2 transition-opacity hover:opacity-80 md:flex"
            href="https://castfy.openstatus.dev/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="font-sans text-muted-foreground text-sm">
              System status:
            </span>
            <span className="font-sans text-foreground text-sm">
              Operational
            </span>
            <div className="relative flex items-center justify-center">
              <div className="relative z-10 h-2 w-2 rounded-full bg-green-500" />
              <div
                className="absolute h-2 w-2 rounded-full bg-green-500"
                style={{
                  animation:
                    "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  willChange: "transform, opacity, box-shadow",
                }}
              />
            </div>
          </Link>
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
            "[textStroke:1px_var(--muted-foreground)]",
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
