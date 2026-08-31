import { Button } from "@castfy/ui/components/button";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import ctaImg from "@/public/design.jpg";
export function ImgCta() {
  return (
    <section
      className="group relative mt-15 flex min-h-[70vh] items-center justify-center md:mt-30"
      id="cta"
    >
      <Image
        alt="cta image"
        className="absolute inset-0 object-cover"
        fill
        placeholder="blur"
        src={ctaImg}
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
      <div className="container relative z-10 flex max-w-300 flex-col items-center justify-center gap-10 py-20">
        <h3 className="max-w-2xl text-balance text-center font-medium text-4xl text-white leading-9 tracking-[-0.04em] md:text-[42px] md:leading-10.5 lg:text-[54px] lg:leading-13.5">
          Demo the app you can’t put on the internet.
        </h3>
        <Button asChild size="xl">
          <a href={siteConfig.waitlistUrl} rel="noopener" target="_blank">
            <span className="text-inherit text-sm">Join the waitlist</span>
          </a>
        </Button>
      </div>
    </section>
  );
}

export function Cta({
  title,
  link,
}: {
  title: string;
  link: { href: string; label: string };
}) {
  return (
    <section className="relative grid grid-cols-12 overflow-hidden rounded-md bg-secondary/50 py-15 md:py-30">
      <div className="relative @md:col-span-8 col-span-12 @md:col-start-3 flex flex-col gap-8 @md:px-0 px-4">
        <h2 className="text-center text-h2">{title}</h2>
        <div className="flex flex-col items-center justify-center">
          <Button asChild className="min-h-10 rounded-full px-6" size="lg">
            <Link href={link.href as Route}>{link.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
