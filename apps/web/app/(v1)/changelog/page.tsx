import { cn } from "@castfy/ui/lib/utils";
import { RssIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { FaDiscord } from "react-icons/fa6";
import { SiteButton } from "@/components/site-button";
import {
  type ChangeKind,
  changelog,
  formatChangelogDate,
} from "@/config/changelog";
import { siteConfig } from "@/config/site";
import { GrainPanel } from "@/features/changelog/grain-panel";
import { PageRails } from "@/features/home/patterns";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Every Castfy release, as it ships: new features, improvements and fixes to the desktop app.",
  alternates: {
    canonical: "/changelog",
    types: { "application/rss+xml": "/changelog/rss.xml" },
  },
};

/** The label colours: brand blue for new, green for improved, grey for fixed. */
const KIND: Record<ChangeKind, string> = {
  New: "bg-brand/10 text-brand dark:bg-brand/20",
  Improved:
    "bg-[#1f9d6b]/10 text-[#16805a] dark:bg-[#1f9d6b]/20 dark:text-[#4fd1a0]",
  Fixed: "bg-secondary text-muted-foreground",
};

export default function ChangelogPage() {
  return (
    <div className="relative flex flex-col">
      <PageRails />

      <header className="page relative pt-10 pb-14 md:pt-14 md:pb-20">
        <GrainPanel className="px-6 py-20 text-center md:py-28">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-h1 text-white [text-shadow:0_2px_24px_rgba(0,40,110,0.25)] md:text-[72px] md:leading-[72px]">
              Changelog
            </h1>
            <p className="text-lg text-white/90 lg:text-xl">
              Every Castfy release, as it ships.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2.5">
              <SiteButton
                className="border-transparent bg-white text-[#0b0d12] shadow-[0_4px_14px_rgba(0,40,100,0.25)] hover:bg-white/90"
                external
                href={siteConfig.discordUrl}
                icon={<FaDiscord className="text-[#5865F2]" />}
                size="sm"
                variant="outline"
              >
                Join the Discord
              </SiteButton>
              <SiteButton
                className="border-white/45 bg-white/15 text-white shadow-none hover:bg-white/25"
                external
                href="/changelog/rss.xml"
                icon={<RssIcon />}
                size="sm"
                variant="outline"
              >
                RSS
              </SiteButton>
            </div>
          </div>
        </GrainPanel>
      </header>

      <ol className="page relative flex flex-col pb-24">
        {changelog.map((entry, i) => (
          <li
            className="grid scroll-mt-24 gap-4 border-t py-12 md:grid-cols-[200px_1fr] md:gap-12 md:py-16 lg:grid-cols-[240px_1fr]"
            id={entry.id}
            key={entry.id}
          >
            <div className="flex flex-col gap-1.5 md:sticky md:top-28 md:self-start">
              <time
                className="font-medium text-foreground"
                dateTime={entry.date}
              >
                {formatChangelogDate(entry.date)}
              </time>
              <a
                className="w-fit font-mono text-muted-foreground text-xs hover:text-foreground"
                href={`#${entry.id}`}
              >
                {entry.version}
              </a>
              {i === 0 ? (
                <span className="mt-1 w-fit rounded-full bg-brand px-2 py-0.5 font-medium text-[11px] text-white">
                  Latest
                </span>
              ) : null}
            </div>

            <article className="flex max-w-2xl flex-col gap-5">
              <div className="flex flex-col gap-3">
                <h2 className="text-balance font-[450] text-[26px] leading-8 tracking-[-0.02em] md:text-[32px] md:leading-10">
                  {entry.title}
                </h2>
                <p className="text-lg text-muted-foreground leading-7">
                  {entry.summary}
                </p>
              </div>

              {entry.image ? (
                <div className="overflow-hidden rounded-xl border bg-secondary shadow-[0_24px_60px_-34px_rgba(0,40,90,0.5)]">
                  <Image
                    alt={entry.image.alt}
                    className="block h-auto w-full"
                    placeholder="blur"
                    quality={80}
                    sizes="(min-width: 1024px) 672px, 100vw"
                    src={entry.image.src}
                  />
                </div>
              ) : null}

              <ul className="flex flex-col gap-3">
                {entry.changes.map((change) => (
                  <li className="flex items-start gap-3" key={change.text}>
                    <span
                      className={cn(
                        "mt-0.5 w-[74px] shrink-0 rounded-md px-2 py-0.5 text-center font-medium text-xs leading-5",
                        KIND[change.kind]
                      )}
                    >
                      {change.kind}
                    </span>
                    <span className="leading-7">{change.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
