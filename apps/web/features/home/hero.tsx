import { Button } from "@castfy/ui/components/button";
import Link from "next/link";
import HeroVid from "./hero-vid";
export function Hero() {
  return (
    <section className="container relative flex flex-col min-h-screen pt-32 md:pt-24 lg:pt-0">
      {/* Header content - centered on mobile, side-by-side on desktop */}
      <div className="flex-1 lg:flex-none flex flex-col justify-center md:justify-start md:pt-16  items-center space-y-8 lg:space-y-0 z-20 px-3 sm:px-4 lg:px-0 lg:max-w-350 lg:mx-auto lg:w-full lg:mb-12 xl:mb-12 2xl:mb-12 3xl:mb-16">
        <div className="flex flex-col items-center w-full text-center space-y-6 lg:space-y-8">
          <div className="space-y-5 lg:space-y-6 max-w-3xl 3xl:max-w-5xl mx-auto px-2 lg:px-0">
            <h1 className=" text-3xl font-serif sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-7xl 3xl:text-8xl leading-[1.1] tracking-tight text-foreground">
              Turn your url into demo
            </h1>

            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed font-sans max-w-xl mx-auto">
              Skip the manual work. Turn any product URL into a polished demo in
              minutes and export it wherever you need.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
            <Button asChild size="xl">
              <a
                href="https://waitlist.castfy.app"
                target="_blank"
                rel="noopener"
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
