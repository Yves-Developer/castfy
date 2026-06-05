import { Button } from "@castfy/ui/components/button";
import { siteConfig } from "@/config/site";

export function HomeCta() {
  return (
    <div className=" py-12 sm:py-16 lg:py-24 border-t">
      <div className="flex flex-col items-center w-full text-center gap-6 lg:gap-8">
        <div className="space-y-5 lg:space-y-6 max-w-3xl 3xl:max-w-5xl mx-auto px-2 lg:px-0">
          <h1 className="font-serif text-3xl sm:text-3xl md:text-4xl lg:text-6xl   leading-[1.1] tracking-tight text-foreground">
            Turn your url into demo today
          </h1>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Button asChild size="xl">
            <a href={`${siteConfig.appUrl}/login`}>
              <span className="text-inherit text-sm">Start your trial</span>
            </a>
          </Button>

          <p className="text-muted-foreground text-xs font-sans">
            14-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
