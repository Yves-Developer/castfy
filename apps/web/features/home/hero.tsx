import { Button } from "@castfy/ui/components/button";
import Link from "next/link";
import { SiClaude, SiOpenai } from "react-icons/si";
import { siteConfig } from "@/config/site";
import { HeroSides } from "./hero-sides";

export function HomeHero() {
  return (
    <div className="relative flex flex-col items-center gap-8 text-center">
      <HeroSides />
      <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-1.5 text-muted-foreground text-sm">
        <AgentLogos />
        Agent-first: record from Claude Code, Codex or Cursor
      </span>
      <div className="flex flex-col items-center gap-5">
        <h1 className="max-w-200 text-balance font-medium text-4xl leading-9 tracking-[-0.04em] md:text-[52px] md:leading-13 lg:text-[64px] lg:leading-16">
          Turn a URL into a narrated product demo
        </h1>
        <p className="max-w-140 text-balance text-lg text-muted-foreground leading-7">
          Tell {siteConfig.name} what to show. Your coding agent clicks through
          your app, and {siteConfig.name} cuts the dead time, zooms on what
          matters and speaks the voiceover.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button asChild size="lg" variant="brand">
          <a href={siteConfig.waitlistUrl} rel="noopener" target="_blank">
            <span className="font-medium text-inherit text-sm">
              Join the waitlist
            </span>
          </a>
        </Button>
        <Button
          asChild
          className="tracking-tight"
          size="lg"
          variant="secondary"
        >
          <Link href="/#demo">Watch it make a demo</Link>
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        <span className="text-foreground">Requires:</span> Claude Code, Codex,
        or Cursor CLI
      </p>
    </div>
  );
}

/** Claude Code, Codex and Cursor, overlapping like avatars. */
function AgentLogos() {
  const tile =
    "-ml-1.5 grid size-5.5 place-items-center rounded-md border-2 border-background first:ml-0 [&_svg]:size-3";
  return (
    <span aria-hidden className="inline-flex">
      <span className={`${tile} bg-[#d97757] text-white`}>
        <SiClaude />
      </span>
      <span className={`${tile} bg-black text-white`}>
        <SiOpenai />
      </span>
      <span className={`${tile} bg-[#14120b] text-white`}>
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <title>Cursor</title>
          <path d="M12 2 21 7v10l-9 5-9-5V7z" />
          <path d="M3 7l9 5 9-5M12 12v10" />
        </svg>
      </span>
    </span>
  );
}
