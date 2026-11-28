import { RssIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";
import { formatPostDate, publishedPosts } from "@/config/blog";
import { GrainPanel } from "@/features/changelog/grain-panel";
import { PageRails } from "@/features/home/patterns";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "How to make product demo videos that people watch: guides, real demos and what we learn building Castfy.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

export default function BlogPage() {
  return (
    <div className="relative flex flex-col">
      <PageRails />
      <header className="page relative pt-10 pb-14 md:pt-14 md:pb-16">
        <GrainPanel className="px-6 py-20 text-center md:py-24">
          <div className="flex flex-col items-center gap-5">
            <h1 className="text-h1 text-white [text-shadow:0_2px_24px_rgba(0,40,110,0.25)] md:text-[64px] md:leading-16">
              Blog
            </h1>
            <p className="max-w-xl text-balance text-lg text-white/90 lg:text-xl">
              How to make product demos people watch, with real demos and the
              prompts that made them.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2.5">
              <DownloadButton
                className="border-transparent bg-white text-[#0b0d12] shadow-[0_4px_14px_rgba(0,40,100,0.25)] hover:bg-white/90"
                size="sm"
                variant="outline"
              />
              <SiteButton
                className="border-white/45 bg-white/15 text-white shadow-none hover:bg-white/25"
                external
                href="/blog/rss.xml"
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
      <section className="page relative pb-24">
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {publishedPosts.map((post) => (
            <li key={post.slug}>
              <Link
                className="group flex flex-col gap-3"
                href={`/blog/${post.slug}`}
              >
                <div className="overflow-hidden rounded-xl border bg-secondary">
                  <Image
                    alt={post.cover.alt}
                    className="block aspect-[1200/630] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    placeholder="blur"
                    quality={80}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    src={post.cover.src}
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>{" "}
                  · {post.minutes} min read
                </p>
                <h2 className="text-balance font-medium text-xl leading-7 tracking-[-0.01em] group-hover:underline group-hover:underline-offset-4">
                  {post.title}
                </h2>
                <p className="text-muted-foreground leading-7">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
