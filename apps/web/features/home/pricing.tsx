import { Button } from "@castfy/ui/components/button";
import { Separator } from "@castfy/ui/components/separator";
import { cn } from "@castfy/ui/lib/utils";
import { CheckIcon } from "lucide-react";
import { pricing, pricingKicker } from "@/config/data";
import type { PricingTier } from "@/types";
import { siteConfig } from "@/config/site";

const tiers: PricingTier[] = [pricing.free, pricing.paid];

export function PricingCards() {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="grid grid-cols-1 gap-y-6 rounded-xl border lg:grid-cols-2">
        {tiers.map((tier, i) => (
          <div
            className={cn(
              "flex flex-1 flex-col gap-1.25 p-5",
              i === 1 && "border-t lg:border-t-0 lg:border-l"
            )}
            key={tier.title}
          >
            <div className="text-lg leading-6">
              <p>{tier.title}</p>
              <p className="text-muted-foreground">{tier.desc}</p>
            </div>
            <div className="flex h-7.5 items-center">
              <Separator />
            </div>
            <p className="flex items-baseline gap-2 text-lg">
              {tier.price}
              {tier.was && (
                <>
                  <span className="text-muted-foreground text-sm line-through">
                    {tier.was}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    one time, not per month
                  </span>
                </>
              )}
            </p>
            <div className="flex h-7.5 items-center">
              <Separator />
            </div>
            <div className="flex flex-col gap-2.5">
              {tier.features.map((f) => (
                <div
                  className="flex items-start gap-2.5 text-muted-foreground leading-5"
                  key={f}
                >
                  <CheckIcon className="mt-1 size-3 shrink-0" />
                  <p>{f}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto flex flex-col gap-3 pt-5">
              {tier.note && (
                <p className="text-muted-foreground text-sm leading-5">
                  {tier.note}
                </p>
              )}
              <Button
                asChild
                className="w-full"
                size="lg"
                variant={i === 1 ? "default" : "secondary"}
              >
                <a
                  href={siteConfig.waitlistUrl}
                  rel="noopener"
                  target="_blank"
                >
                  <span className="text-inherit text-sm">{tier.cta}</span>
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm italic">{pricingKicker}</p>
    </div>
  );
}
