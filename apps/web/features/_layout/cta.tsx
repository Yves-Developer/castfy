import { Button } from "@castfy/ui/components/button";
import type { Route } from "next";
import Link from "next/link";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";
import { siteConfig } from "@/config/site";
import { WaveEdge } from "@/features/home/patterns";
/** The closing block: dark, with a voice waveform for its top edge. */
export function ImgCta() {
  return (
    <section className="mt-16 md:mt-24" id="cta">
      <WaveEdge className="text-[#0b0d12]" />
      <div className="bg-[#0b0d12] text-white">
        <div className="page flex flex-col items-center gap-6 py-24 text-center md:py-32">
          <h3 className="max-w-2xl text-balance font-medium text-4xl leading-9 tracking-[-0.04em] md:text-[42px] md:leading-10.5 lg:text-[54px] lg:leading-13.5">
            Your next release deserves a demo today.
          </h3>
          <p className="max-w-md text-white/60">
            A URL and a sentence. {siteConfig.name} does the rest, on your
            machine.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            <DownloadButton />
            <SiteButton
              arrow
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
              external
              href={siteConfig.waitlistUrl}
              variant="outline"
            >
              Join beta
            </SiteButton>
          </div>
        </div>
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
