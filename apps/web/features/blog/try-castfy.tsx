"use client";

import posthog from "posthog-js";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";

/** Which call to action a reader took, and from which post. */
function track(cta: string, post: string) {
  posthog.capture("blog_cta_clicked", { cta, post });
}

/** The end of every post: try Castfy, or have us make the demo. */
export function TryCastfy({ post }: { post: string }) {
  return (
    <section
      className="my-12 flex flex-col items-start gap-4 rounded-2xl border bg-secondary/40 p-6 md:p-8"
      onClickCapture={(e) => {
        const label = (e.target as HTMLElement)
          .closest("a")
          ?.textContent?.trim();
        if (label) {
          track(label, post);
        }
      }}
    >
      <h2 className="font-medium text-2xl tracking-[-0.01em]">
        Make your own demo
      </h2>
      <p className="text-muted-foreground leading-7">
        Paste a URL, say what to show, and your coding agent records it on your
        machine. Castfy cuts the dead time, adds the voice and gives you a video
        to share.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <DownloadButton size="sm" />
        <SiteButton arrow href="/demos" size="sm" variant="outline">
          See more demos
        </SiteButton>
      </div>
    </section>
  );
}

/** Midway through a post: send us a URL and we make the demo. */
export function FreeDemo({ post }: { post: string }) {
  return (
    <aside
      className="my-8 flex flex-col gap-3 rounded-xl border border-brand/30 bg-brand/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a")) {
          track("free demo", post);
        }
      }}
    >
      <p className="m-0 leading-7">
        <span className="font-medium">Rather have us make it?</span> Send your
        URL and we'll record your demo for free.
      </p>
      <SiteButton
        className="shrink-0"
        href="/contact"
        size="sm"
        variant="outline"
      >
        Get a free demo
      </SiteButton>
    </aside>
  );
}
