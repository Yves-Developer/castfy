import type { Metadata } from "next";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";
import { demos } from "@/config/demos";
import { siteConfig } from "@/config/site";
import { GrainPanel } from "@/features/changelog/grain-panel";
import { DemoGrid } from "@/features/demos/demo-grid";
import { PageRails } from "@/features/home/patterns";

export const metadata: Metadata = {
  title: "Demos made with Castfy",
  description:
    "Real product demos of open-source apps, recorded by a coding agent and edited by Castfy, with the prompt that made each one.",
  alternates: { canonical: "/demos" },
};

export default function DemosPage() {
  return (
    <div className="relative flex flex-col">
      <PageRails />
      <header className="page relative pt-10 pb-14 md:pt-14 md:pb-16">
        <GrainPanel className="px-6 py-20 text-center md:py-24">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-h1 text-white [text-shadow:0_2px_24px_rgba(0,40,110,0.25)] md:text-[64px] md:leading-16">
              Made with Castfy
            </h1>
            <p className="max-w-xl text-balance text-lg text-white/90 lg:text-xl">
              Real demos of real apps, recorded by an agent and edited by
              Castfy. Every one comes with the prompt that made it.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2.5">
              <DownloadButton
                className="border-transparent bg-white text-[#0b0d12] shadow-[0_4px_14px_rgba(0,40,100,0.25)] hover:bg-white/90"
                size="sm"
                variant="outline"
              />
              <SiteButton
                arrow
                className="border-white/45 bg-white/15 text-white shadow-none hover:bg-white/25"
                external
                href={siteConfig.waitlistUrl}
                size="sm"
                variant="outline"
              >
                Get a beta code
              </SiteButton>
            </div>
          </div>
        </GrainPanel>
      </header>
      <section className="page relative pb-24">
        <DemoGrid demos={demos} />
      </section>
    </div>
  );
}
