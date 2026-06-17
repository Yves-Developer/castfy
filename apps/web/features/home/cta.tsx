import { Button } from "@castfy/ui/components/button";

export function HomeCta() {
  return (
    <div className=" py-12 sm:py-16 lg:py-24 border-t">
      <div className="flex flex-col items-center w-full text-center gap-6 lg:gap-8">
        <div className="space-y-5 lg:space-y-6 max-w-3xl 3xl:max-w-5xl mx-auto px-2 lg:px-0">
          <h1 className="font-serif capitalize text-3xl sm:text-3xl md:text-4xl lg:text-5xl   leading-[1.1] 2xl:text-6xl tracking-tight text-foreground">
            Turn your url into demo today
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button asChild size="xl">
            <a
              href="https://waitlist.castfy.app"
              target="_blank"
              rel="noopener"
            >
              <span className="text-inherit text-sm">Join waitlist</span>
            </a>
          </Button>

          <p className="text-muted-foreground text-xs font-sans">
            Product is still in development
          </p>
        </div>
      </div>
    </div>
  );
}
