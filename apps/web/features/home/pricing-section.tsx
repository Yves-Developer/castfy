"use client";

import { Button } from "@castfy/ui/components/button";
import { PlanCards } from "@castfy/ui/components/plan-cards";
import { siteConfig } from "@/config/site";

export function PricingSection() {
  return (
    <section className="max-w-350  w-full mx-auto" id="pricing">
      <div className="text-center space-y-4 mb-12">
        <h2 className="font-serif text-2xl sm:text-2xl text-foreground">
          Pricing that matches how you run your business
        </h2>
        <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal">
          Start simple, upgrade when your workflow gets more complex.
        </p>
      </div>

      <PlanCards
        footnote="14-day free trial"
        renderStarterAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a href={`${siteConfig.appUrl}/login`}>Start your trial</a>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center">
              Best for getting started
            </p>
          </>
        )}
        renderProAction={() => (
          <>
            <Button asChild className="w-full text-sm">
              <a href={`${siteConfig.appUrl}/login`}>Start your trial</a>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center">
              Best value for most businesses
            </p>
          </>
        )}
      />
    </section>
  );
}
