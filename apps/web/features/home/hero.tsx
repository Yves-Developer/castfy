"use client";
import { Button } from "@castfy/ui/components/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function HomeHero() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="max-w-200 text-balance font-medium text-4xl leading-9 tracking-[-0.04em] md:text-[42px] md:leading-10.5 lg:text-[54px] lg:leading-13.5">
        Turn any URL into a working demo with AI
      </h1>
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          <Button asChild className={"tracking-tight"} size="lg">
            <a
              href="https://waitlist.castfy.app"
              rel="noopener"
              target="_blank"
            >
              <span className="text-inherit text-sm">Join Waitlist</span>
            </a>
          </Button>
          <Button
            asChild
            className="tracking-tight"
            size="lg"
            variant={"secondary"}
          >
            <Link href="/#features">Explore features</Link>
          </Button>
        </div>
        <Link
          className="hidden items-center gap-2 text-muted-foreground text-sm transition-all duration-300 hover:gap-3 lg:flex"
          href="/"
        >
          <p>
            <span className="text-foreground">New release</span>:{" "}
            {siteConfig.name} 2.0
          </p>
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </div>
  );
}
