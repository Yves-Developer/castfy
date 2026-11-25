import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadButton } from "@/components/download-button";
import { SiteButton } from "@/components/site-button";
import { demos, formatDuration } from "@/config/demos";
import { siteConfig } from "@/config/site";
import { CopyPrompt } from "@/features/demos/copy-prompt";
import { DemoPlayer } from "@/features/demos/demo-player";
import { PageRails } from "@/features/home/patterns";

export function generateStaticParams() {
  return demos.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  props: PageProps<"/demos/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const demo = demos.find((d) => d.slug === slug);
  if (!demo) {
    return {};
  }
  return {
    title: `${demo.app}: ${demo.title}`,
    description: `${demo.description} A product demo made with Castfy.`,
    alternates: { canonical: `/demos/${demo.slug}` },
  };
}

export default async function DemoPage(props: PageProps<"/demos/[slug]">) {
  const { slug } = await props.params;
  const demo = demos.find((d) => d.slug === slug);
  if (!demo) {
    notFound();
  }
  const related = demos.filter((d) => d.slug !== demo.slug).slice(0, 3);
  const stats = [
    { label: "Agent worked", value: formatDuration(demo.rawSeconds) },
    { label: "Finished demo", value: formatDuration(demo.finalSeconds) },
    // Only shown when the run's step log was kept with the demo.
    ...(demo.steps
      ? [
          {
            label: "Steps that worked",
            value: `${demo.steps.succeeded} of ${demo.steps.total}`,
          },
        ]
      : [{ label: "Agent turns", value: String(demo.turns ?? "") }]),
    { label: "Voice", value: demo.voice },
  ].filter((s) => s.value);

  return (
    <div className="relative flex flex-col">
      <PageRails />
      <div className="page relative flex flex-col gap-10 pt-10 pb-24 md:pt-14">
        <Link
          className="inline-flex w-fit items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
          href="/demos"
        >
          <ArrowLeftIcon className="size-4" /> All demos
        </Link>

        <div className="flex flex-col gap-3">
          <a
            className="inline-flex w-fit items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
            href={demo.appUrl}
            rel="noopener"
            target="_blank"
          >
            {demo.app} <ArrowUpRightIcon className="size-3.5" />
          </a>
          <h1 className="text-h1">{demo.title}</h1>
          <p className="max-w-2xl text-sub">{demo.description}</p>
        </div>

        <DemoPlayer
          aspectRatio={demo.media.poster.width / demo.media.poster.height}
          label={`Castfy demo: ${demo.app}, ${demo.title}`}
          poster={demo.media.poster.src}
          src={demo.media.video}
        />

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
          {stats.map((s) => (
            <div
              className="flex flex-col gap-1 bg-background p-4"
              key={s.label}
            >
              <dt className="text-muted-foreground text-xs">{s.label}</dt>
              <dd className="font-medium text-xl tracking-[-0.01em]">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <section className="flex flex-col gap-4">
            <h2 className="font-medium text-xl">The prompt</h2>
            <p className="text-muted-foreground text-sm">
              Given to {demo.agent} with the URL{" "}
              <code className="font-mono text-foreground">{demo.url}</code> and
              the {demo.voice} voice.
            </p>
            <CopyPrompt prompt={demo.prompt} />
          </section>
          <section className="flex flex-col gap-4 rounded-2xl border bg-secondary/40 p-6">
            <h2 className="font-medium text-xl">Make this demo yourself</h2>
            <ol className="flex list-decimal flex-col gap-2 pl-5 text-muted-foreground leading-7">
              <li>Download Castfy and enter your beta code.</li>
              <li>Paste the URL and the prompt.</li>
              <li>Pick a voice and press Record.</li>
            </ol>
            <div className="mt-1 flex flex-wrap gap-2.5">
              <DownloadButton size="sm" />
              <SiteButton
                arrow
                external
                href={siteConfig.waitlistUrl}
                size="sm"
                variant="outline"
              >
                Get a beta code
              </SiteButton>
            </div>
          </section>
        </div>

        {related.length > 0 ? (
          <section className="flex flex-col gap-6 border-t pt-10">
            <h2 className="font-medium text-xl">More demos</h2>
            <ul className="grid gap-6 sm:grid-cols-3">
              {related.map((d) => (
                <li key={d.slug}>
                  <Link
                    className="group flex flex-col gap-3"
                    href={`/demos/${d.slug}`}
                  >
                    <div className="overflow-hidden rounded-xl border">
                      <Image
                        alt=""
                        className="block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]"
                        placeholder="blur"
                        sizes="(min-width: 640px) 33vw, 100vw"
                        src={d.media.poster}
                      />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {d.app}
                    </span>
                    <span className="-mt-2 font-medium group-hover:underline group-hover:underline-offset-4">
                      {d.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
