"use client";
import { Button } from "@workspace/ui/components/button";
import { useScroll } from "@workspace/ui/hooks/use-scroll";
import { cn } from "@workspace/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/config/data";
import { siteConfig } from "@/config/site";
import { MobileNav } from "./mobile-nav";

export function SiteHeader() {
  const scrolled = useScroll(10);
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-transparent border-b bg-background",
        scrolled && "border-border"
      )}
    >
      <nav className="container flex h-14 w-full items-center justify-between md:h-12">
        <Link className="font-plus-jakarta-sans font-semibold text-xl" href="/">
          {siteConfig.name}
        </Link>
        <div className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) => (
            <Link
              className={cn(
                "font-medium text-muted-foreground text-sm hover:text-foreground",
                pathname === link.href && "text-foreground"
              )}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" variant="outline">
            Log in
          </Button>
          <Button size="sm">Sign up</Button>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
