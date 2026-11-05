"use client";

import { useScroll } from "@castfy/ui/hooks/use-scroll";
import { cn } from "@castfy/ui/lib/utils";
import { MousePointer2Icon } from "lucide-react";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";
import { navLinks } from "@/config/data";
import { siteConfig } from "@/config/site";
import MobileMenu from "./mobile-menu";

interface HeaderProps {
  hideMenuItems?: boolean;
}

/**
 * Stays at the top; once the page scrolls it gets a frosted background. Its
 * bottom line is where the page rails start, with a "+" on each.
 */
export function Header({ hideMenuItems = false }: HeaderProps) {
  const scrolled = useScroll(10);

  return (
    <nav
      className={cn(
        "fixed top-0 right-0 left-0 z-50 w-full border-b transition-colors duration-200",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-md"
          : "border-border/70 bg-background"
      )}
    >
      <div className="frame relative flex h-16 items-center justify-between px-2 md:px-6 lg:px-8">
        <span
          aria-hidden
          className="absolute -bottom-2.5 left-0 -translate-x-1/2 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden"
        >
          +
        </span>
        <span
          aria-hidden
          className="absolute right-0 -bottom-2.5 translate-x-1/2 font-mono text-muted-foreground/60 text-sm leading-4 max-md:hidden"
        >
          +
        </span>

        <Link
          aria-label="Castfy - Go to homepage"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
          href="/"
        >
          <MousePointer2Icon className="size-6 rotate-90 fill-foreground" />
          <span className="font-medium text-foreground text-lg">
            {siteConfig.name}
          </span>
        </Link>

        {hideMenuItems ? null : (
          <>
            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <Link
                  className="rounded-lg px-3 py-2 font-medium text-muted-foreground text-sm transition-colors hover:bg-secondary hover:text-foreground"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-1.5 lg:flex">
              <SiteButton
                external
                href={siteConfig.discordUrl}
                icon={<FaDiscord />}
                size="sm"
                variant="discord"
              >
                Discord
              </SiteButton>
              <SiteButton
                arrow
                external
                href={siteConfig.waitlistUrl}
                size="sm"
                variant="outline"
              >
                Join beta
              </SiteButton>
              <DownloadButton size="sm" />
            </div>
          </>
        )}

        <MobileMenu />
      </div>
    </nav>
  );
}
