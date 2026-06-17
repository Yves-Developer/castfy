"use client";

import { Button } from "@castfy/ui/components/button";
import { useScroll } from "@castfy/ui/hooks/use-scroll";
import { cn } from "@castfy/ui/lib/utils";
import { MousePointer2Icon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { navLinks } from "@/config/data";
import { siteConfig } from "@/config/site";

interface HeaderProps {
  hideMenuItems?: boolean;
}

export function Header({ hideMenuItems = false }: HeaderProps) {
  const scrolled = useScroll(10);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const headerRef = useRef<HTMLDivElement>(null);

  const handleTouchEnd = (e: React.TouchEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    target.blur();

    setTimeout(() => {
      target.blur();
    }, 100);
  };

  return (
    <>
      <nav className="fixed top-0 right-0 left-0 z-50 w-full">
        <div
          className={cn(
            "container relative flex items-center justify-between bg-background py-3",
            isMenuOpen && "border-border border-b"
          )}
          ref={headerRef}
        >
          <Link
            aria-label="Midday - Go to homepage"
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
              <div className="hidden items-center gap-6 xl:flex">
                {navLinks.map((link) => (
                  <Link
                    className={cn(
                      "text-muted-foreground text-sm transition-colors hover:text-foreground",
                      pathname === link.href && "text-foreground"
                    )}
                    key={link.href}
                    {...(link.external
                      ? {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {})}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <Button
                asChild
                className="hidden lg:flex"
                variant={scrolled ? "default" : "ghost"}
              >
                <a
                  href="https://waitlist.castfy.app"
                  rel="noopener"
                  target="_blank"
                >
                  Get started
                </a>
              </Button>
            </>
          )}

          <div className="flex items-center xl:hidden">
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="relative flex min-h-11 min-w-11 touch-manipulation items-center justify-end p-2 text-primary transition-colors hover:text-primary/80 focus:outline-none focus-visible:outline-none"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              style={{ WebkitTapHighlightColor: "transparent" }}
              type="button"
            >
              <div className="relative flex size-5 flex-col items-center justify-center">
                <motion.span
                  animate={{
                    rotate: isMenuOpen ? 45 : 0,
                    y: isMenuOpen ? 0 : -4.5,
                  }}
                  className="absolute h-[1.5px] w-4 bg-current"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
                <motion.span
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                    scaleX: isMenuOpen ? 0 : 1,
                  }}
                  className="absolute h-[1.5px] w-4 bg-current"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
                <motion.span
                  animate={{
                    rotate: isMenuOpen ? -45 : 0,
                    y: isMenuOpen ? 0 : 4.5,
                  }}
                  className="absolute h-[1.5px] w-4 bg-current"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background xl:hidden">
          <div className="px-6 pt-28">
            <div className="flex flex-col space-y-6 text-left">
              {navLinks.map((link) => (
                <Link
                  className="touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none"
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  onTouchEnd={handleTouchEnd}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="mt-8 border-border border-t pt-8">
                <a
                  className="touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none"
                  href={`${siteConfig.appUrl}/login`}
                  onTouchEnd={handleTouchEnd}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
