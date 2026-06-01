"use client";

import { cn } from "@workspace/ui/lib/utils";
import { MousePointer2Icon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { siteConfig } from "@/config/site";

interface HeaderProps {
  hideMenuItems?: boolean;
  transparent?: boolean;
}

export function Header({
  transparent = false,
  hideMenuItems = false,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 right-0 left-0 z-50 w-full">
        <div
          className={cn(
            "relative flex items-center justify-between px-4 py-3 sm:px-4 md:px-4 lg:px-4 xl:gap-6 xl:px-6 xl:py-4 2xl:px-8",
            isMenuOpen && "border-border border-b",
            !transparent && "bg-background-semi-transparent backdrop-blur-md"
          )}
          ref={headerRef}
        >
          {/* Logo and Brand */}
          <Link
            aria-label="Midday - Go to homepage"
            className="flex touch-manipulation items-center gap-2 transition-opacity duration-200 hover:opacity-80 active:opacity-80"
            href="/"
            onClick={() => setIsMenuOpen(false)}
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <MousePointer2Icon className="size-6 rotate-90 fill-foreground" />

            <span className="font-medium text-base text-foreground xl:hidden">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          {!hideMenuItems && (
            <div className="hidden items-center gap-6 xl:flex">
              <Link
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                href="/features"
              >
                Features
              </Link>

              <Link
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                href="/story"
              >
                Story
              </Link>
              <Link
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                href="/download"
              >
                Download
              </Link>
              <Link
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                href="/contact"
              >
                Contact us
              </Link>

              {/* Sign in */}
              <div className="border-border border-l pl-4">
                <Link
                  className="text-primary text-sm transition-colors hover:text-primary/80"
                  href="https://app.midday.ai/"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}

          {/* Mobile & Tablet Hamburger Menu */}
          <div className="flex items-center xl:hidden">
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="relative flex min-h-11 min-w-11 touch-manipulation items-center justify-end p-2 text-primary transition-colors hover:text-primary/80 focus:outline-none focus-visible:outline-none xl:active:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
              type="button"
            >
              <div className="relative flex size-5 flex-col items-center justify-center">
                <motion.span
                  animate={{
                    rotate: isMenuOpen ? 45 : 0,
                    y: isMenuOpen ? 0 : -4.5,
                  }}
                  className="absolute h-[1.5px] w-4 rounded-none bg-current"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
                <motion.span
                  animate={{
                    opacity: isMenuOpen ? 0 : 1,
                    scaleX: isMenuOpen ? 0 : 1,
                  }}
                  className="absolute h-[1.5px] w-4 rounded-none bg-current"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
                <motion.span
                  animate={{
                    rotate: isMenuOpen ? -45 : 0,
                    y: isMenuOpen ? 0 : 4.5,
                  }}
                  className="absolute h-[1.5px] w-4 rounded-none bg-current"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile & Tablet Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background xl:hidden">
          <div className="px-6 pt-28">
            <div className="flex flex-col space-y-6 text-left">
              <Link
                className="no-touch-active touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none xl:active:text-primary"
                href="/features"
                onClick={() => setIsMenuOpen(false)}
                onTouchEnd={(e) => {
                  const target = e.currentTarget;
                  if (target) {
                    target.blur();
                    setTimeout(() => {
                      if (target) {
                        target.blur();
                      }
                    }, 100);
                  }
                }}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Features
              </Link>
              <Link
                className="no-touch-active touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none xl:active:text-primary"
                href="/story"
                onClick={() => setIsMenuOpen(false)}
                onTouchEnd={(e) => {
                  const target = e.currentTarget;
                  if (target) {
                    target.blur();
                    setTimeout(() => {
                      if (target) {
                        target.blur();
                      }
                    }, 100);
                  }
                }}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Story
              </Link>
              <Link
                className="no-touch-active touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none xl:active:text-primary"
                href="/download"
                onClick={() => setIsMenuOpen(false)}
                onTouchEnd={(e) => {
                  const target = e.currentTarget;
                  if (target) {
                    target.blur();
                    setTimeout(() => {
                      if (target) {
                        target.blur();
                      }
                    }, 100);
                  }
                }}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Download
              </Link>

              <Link
                className="no-touch-active touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none xl:active:text-primary"
                href="/resources"
                onClick={() => setIsMenuOpen(false)}
                onTouchEnd={(e) => {
                  const target = e.currentTarget;
                  if (target) {
                    target.blur();
                    setTimeout(() => {
                      if (target) {
                        target.blur();
                      }
                    }, 100);
                  }
                }}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                Resources
              </Link>

              {/* Sign in */}
              <div className="mt-8 border-border border-t pt-8">
                <Link
                  className="touch-manipulation py-2 font-sans text-2xl text-primary transition-colors hover:text-primary focus:outline-none focus-visible:outline-none xl:active:text-primary"
                  href={siteConfig.appUrl}
                  onTouchEnd={(e) => {
                    const target = e.currentTarget;
                    if (target) {
                      target.blur();
                      setTimeout(() => {
                        if (target) {
                          target.blur();
                        }
                      }, 100);
                    }
                  }}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
