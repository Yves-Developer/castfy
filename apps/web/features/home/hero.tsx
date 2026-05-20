"use client";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

export function HomeHero() {
  return (
    <section
      className="flex flex-col items-center justify-center gap-10"
      id="hero"
    >
      <div className="mx-auto flex max-w-lg flex-col items-center gap-10">
        <Badge className="px-3 text-muted-foreground" variant={"outline"}>
          Trusted by 10k+ Marketers
        </Badge>
        <h1 className="text-balance text-center font-semibold text-3xl leading-[1.2] tracking-[-1] md:text-4xl lg:text-5xl xl:text-[56px]">
          Turn your url into demo in seconds
        </h1>
        <p className="text-balance text-center font-normal text-muted-foreground lg:text-xl lg:leading-[1.3]">
          No more manual work of creating demos, paste your product url and get
          demo
        </p>
      </div>
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <Button asChild className="roundedfull text-base" size="xl">
          <Link href="/contact-sales">Sign up</Link>
        </Button>
        <Button
          asChild
          className="roundedfull text-base"
          size="xl"
          variant={"secondary"}
        >
          <Link href="/about">Request demo</Link>
        </Button>
      </div>
    </section>
  );
}
