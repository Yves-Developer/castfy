"use client";
import { Button } from "@workspace/ui/components/button";
import { useScroll } from "@workspace/ui/hooks/use-scroll";
import { cn } from "@workspace/ui/lib/utils";
import { Logo } from "@/components/logo";
import { navLinks } from "@/config/data";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const scrolled = useScroll(10);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-6xl border-transparent border-b md:rounded-full md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-5xl md:shadow-oo":
            scrolled,
        }
      )}
    >
      <nav
        className={cn(
          "container flex h-14 w-full items-center justify-between md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          }
        )}
      >
        <a
          className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
          href="/"
        >
          <Logo className="h-4" />
        </a>
        <div className="hidden items-center gap-2 md:flex">
          <div>
            {navLinks.map((link) => (
              <Button
                asChild
                className="rounded-full"
                key={link.label}
                size="sm"
                variant="ghost"
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
          <Button className="rounded-full" size="sm" variant="outline">
            Sign In
          </Button>
          <Button className="rounded-full" size="sm">
            Get Started
          </Button>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
