"use client";
import { AspectRatio } from "@workspace/ui/components/aspect-ratio";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function HomeHero() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-10"
      id="hero"
    >
      <div className="max-w2xl mx-auto flex flex-col items-center gap-10">
        {/* <Badge className="px-3 text-muted-foreground" variant={"outline"}>
          Trusted by 10k+ Marketers
        </Badge> */}
        <h1 className="text-balance text-center font-semibold text-3xl leading-[1.2] tracking-[-1] md:text-4xl lg:text-5xl xl:text-6xl">
          Turn your url into demo in seconds
        </h1>
        <p className="max-w-3xl text-balance text-center font-normal text-muted-foreground lg:text-xl lg:leading-[1.3]">
          No more manual work of creating demos, paste your product url and get
          demo easily and fast.
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Button asChild className="rounded-full text-base" size="xl">
          <Link href="/contact-sales">Sign Up</Link>
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
      <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-lg">
        <AspectRatio className="bg-muted" ratio={16 / 9}>
          <video
            autoPlay
            className="aspect-video h-full w-full object-cover"
            loop
            playsInline
            src="https://screen.studio/videos/hero/hero-demo.mp4"
          >
            <track
              kind="captions"
              src="https://screen.studio/videos/hero/hero-demo.mp4"
            />
          </video>
        </AspectRatio>
      </div>
    </section>
  );
}
