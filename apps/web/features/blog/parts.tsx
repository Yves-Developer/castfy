import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { demos } from "@/config/demos";
import changeStep from "@/public/blog/change-step.webp";
import model from "@/public/blog/model.webp";
import agentView from "@/public/landing/agent-view.webp";
import realScreen from "@/public/landing/real-screen.webp";
import record from "@/public/landing/record-1-0.webp";
import studio from "@/public/landing/studio-1-0.webp";
import { CopyPrompt } from "@/features/demos/copy-prompt";
import { DemoPlayer } from "@/features/demos/demo-player";

/** Screens from the real app a post can show, by name. */
const SHOTS: Record<string, StaticImageData> = {
  "agent-view": agentView,
  "change-step": changeStep,
  model,
  "real-screen": realScreen,
  record,
  studio,
};

/** A screenshot of the app, with its caption. */
export function Shot({
  name,
  alt,
  caption,
}: {
  name: string;
  alt: string;
  caption?: string;
}) {
  const src = SHOTS[name];
  if (!src) {
    return null;
  }
  return (
    <figure className="my-8 flex flex-col gap-2.5">
      <div className="overflow-hidden rounded-xl border bg-secondary shadow-[0_24px_60px_-34px_rgba(0,40,90,0.5)]">
        <Image
          alt={alt}
          className="block h-auto w-full"
          placeholder="blur"
          quality={80}
          sizes="(min-width: 768px) 672px, 100vw"
          src={src}
        />
      </div>
      {caption ? (
        <figcaption className="text-center text-muted-foreground text-sm">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** A demo from the gallery, playable in the post, with a link to its page. */
export function Demo({ slug }: { slug: string }) {
  const demo = demos.find((d) => d.slug === slug);
  if (!demo) {
    return null;
  }
  return (
    <figure className="my-8 flex flex-col gap-2.5">
      <DemoPlayer
        aspectRatio={demo.media.poster.width / demo.media.poster.height}
        label={`Castfy demo: ${demo.app}, ${demo.title}`}
        poster={demo.media.poster.src}
        src={demo.media.video}
      />
      <figcaption className="text-center text-muted-foreground text-sm">
        {demo.title}, made with Castfy.{" "}
        <Link
          className="text-foreground underline underline-offset-4"
          href={`/demos/${demo.slug}`}
        >
          See the prompt and the numbers
        </Link>
      </figcaption>
    </figure>
  );
}

/** The exact prompt, with a copy button: <Prompt text="…" />. */
export function Prompt({ text }: { text: string }) {
  return (
    <div className="my-6">
      <CopyPrompt prompt={text.trim()} />
    </div>
  );
}

/** Numbered steps; each Step has a title and its text. */
export function Steps({ children }: { children: ReactNode }) {
  return (
    <ol className="my-8 flex flex-col gap-8 [counter-reset:step]">
      {children}
    </ol>
  );
}

export function Step({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <li className="relative pl-11 [counter-increment:step] before:absolute before:top-0 before:left-0 before:grid before:size-7 before:place-items-center before:rounded-lg before:bg-brand before:font-medium before:text-sm before:text-white before:content-[counter(step)]">
      <h3 className="font-medium text-lg leading-7">{title}</h3>
      <div className="text-muted-foreground leading-7 [&_p]:mt-2">
        {children}
      </div>
    </li>
  );
}

/** An aside: a tip or a caveat. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 rounded-xl border bg-secondary/50 px-5 py-4 text-[15px] leading-7 [&_p]:m-0">
      {children}
    </aside>
  );
}
