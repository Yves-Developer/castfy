import { Button } from "@castfy/ui/components/button";

export function HomeCta() {
  return (
    <div className="border-t py-12 sm:py-16 lg:py-24">
      <div className="flex w-full flex-col items-center gap-6 text-center lg:gap-8">
        <div className="mx-auto 3xl:max-w-5xl max-w-3xl space-y-5 px-2 lg:space-y-6 lg:px-0">
          <h1 className="font-serif text-3xl text-foreground capitalize leading-[1.1] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl">
            Turn your url into demo today
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button asChild size="xl">
            <a
              href="https://waitlist.castfy.app"
              rel="noopener"
              target="_blank"
            >
              <span className="text-inherit text-sm">Join waitlist</span>
            </a>
          </Button>

          <p className="font-sans text-muted-foreground text-xs">
            Product is still in development
          </p>
        </div>
      </div>
    </div>
  );
}
