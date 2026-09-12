import { Button } from "@castfy/ui/components/button";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export function HomeHero() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <h1 className="max-w-200 text-balance font-medium text-4xl leading-9 tracking-[-0.04em] md:text-[42px] md:leading-10.5 lg:text-[50px] lg:leading-13.5">
          {siteConfig.name} is the AI recording app for every step from url to
          demo
        </h1>
        {/* <p className="max-w-160 text-balance text-lg text-muted-foreground leading-7">
          A URL and a prompt become a finished demo video, recorded by a browser
          on your own machine. So it reaches localhost. A cloud tool can’t.
        </p> */}
      </div>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild size="lg" variant={"brand"}>
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
            variant={"secondary"}
          >
            <Link href="/#journey">Explore the product</Link>
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          <span className="text-foreground">Requires:</span> Claude Code, Codex,
          or Cursor CLI
        </p>
      </div>
    </div>
  );
}
