"use client";

import { Button } from "@castfy/ui/components/button";
import { useScroll } from "@castfy/ui/hooks/use-scroll";
import { cn } from "@castfy/ui/lib/utils";
import { MousePointer2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/config/data";
import { siteConfig } from "@/config/site";
import MobileMenu from "./mobile-menu";

interface HeaderProps {
  hideMenuItems?: boolean;
}

export function Header({ hideMenuItems = false }: HeaderProps) {
  const scrolled = useScroll(10);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 w-full">
      <div
        className={cn(
          "container relative flex items-center justify-between bg-background py-3",
          isMenuOpen && "border-border border-b"
        )}
      >
        <Link
          aria-label="Castfy - Go to homepage"
          className="flex touch-manipulation items-center gap-2 transition-opacity duration-200 hover:opacity-80 active:opacity-80"
          href="/"
          onClick={() => setIsMenuOpen(false)}
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <MousePointer2Icon className="size-6 rotate-90 fill-foreground" />
          <span className="font-medium text-foreground text-lg">
            {siteConfig.name}
          </span>
        </Link>

        {!hideMenuItems && (
          <>
            <div className="hidden items-center gap-8 lg:flex">
              {navLinks.map((link) => (
                <Link
                  className={cn(
                    "font-medium text-muted-foreground text-sm hover:text-foreground",
                    pathname === link.href && "text-foreground"
                  )}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Button
              asChild
              className="hidden lg:flex"
              variant={scrolled ? "default" : "secondary"}
            >
              <a
                href={siteConfig.waitlistUrl}
                rel="noopener"
                target="_blank"
              >
                Get started
              </a>
            </Button>
          </>
        )}

        <MobileMenu />
      </div>
    </nav>
  );
}
