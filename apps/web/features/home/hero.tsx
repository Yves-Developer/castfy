import { Button } from "@castfy/ui/components/button";
import Link from "next/link";
import HeroVid from "./hero-vid";
export function Hero() {
  return (
    <section className="container relative flex min-h-screen flex-col pt-32 md:pt-24 lg:pt-0">
      {/* Header content - centered on mobile, side-by-side on desktop */}
      <div className="z-20 3xl:mb-16 flex flex-1 flex-col items-center justify-center space-y-8 px-3 sm:px-4 md:justify-start md:pt-16 lg:mx-auto lg:mb-12 lg:w-full lg:max-w-350 lg:flex-none lg:space-y-0 lg:px-0 xl:mb-12 2xl:mb-12">
        <div className="flex w-full flex-col items-center space-y-6 text-center lg:space-y-8">
          <div className="mx-auto 3xl:max-w-5xl max-w-3xl space-y-5 px-2 lg:space-y-6 lg:px-0">
            <h1 className="font-serif 3xl:text-8xl text-3xl text-foreground leading-[1.1] tracking-tight sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-7xl">
              Turn your url into demo
            </h1>

            <p className="mx-auto max-w-xl font-sans text-base text-muted-foreground leading-relaxed lg:text-lg">
              Skip the manual work. Turn any product URL into a polished demo in
              minutes and export it wherever you need.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 pt-2 md:flex-row">
            <Button asChild size="xl">
              <a
                href="https://waitlist.castfy.app"
                rel="noopener"
                target="_blank"
              >
                <span className="text-inherit text-sm">Join waiting list</span>
              </a>
            </Button>
            <Button asChild size="xl" variant={"secondary"}>
              <Link href="/#how">Discover product</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Video section */}
      <HeroVid />
    </section>
  );
}
