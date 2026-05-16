"use client";
import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-10"
      id="hero"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10">
        <h1 className="text-balance text-center font-medium font-serif text-3xl tracking-[-.03em] md:text-4xl lg:text-5xl">
          Your product url into demoed in seconds.
        </h1>
        <p className="hidden text-balance text-center font-normal text-muted-foreground md:block lg:text-lg lg:leading-9">
          Paste your URL and watch AI turn your website into a beautiful,
          interactive product tour in minutes — no setup required.
        </p>
        <p className="text-center font-normal text-muted-foreground text-sm leading-6 sm:text-base md:hidden">
          Paste your URL and watch AI turn your website into a demo.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Button asChild className="rounded-full text-base" size="xl">
          <Link href="/contact-sales">Get Started</Link>
        </Button>
        <Button
          asChild
          className="rounded-full text-base"
          size="xl"
          variant={"secondary"}
        >
          <Link href="/about">Request Demo</Link>
        </Button>
      </div>
      <div className="relative mt-10">
        <Image
          alt="Hero"
          className="h-auto w-full max-w-7xl rounded-xl lg:rounded-[2.5rem]"
          height={800}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
          src="/hero.svg"
          width={1200}
        />
        <div className="absolute bottom-0 left-0 h-12 w-full from-transparent to-background max-md:hidden lg:h-24 dark:bg-gradient-to-b" />
      </div>
    </section>
  );
}
