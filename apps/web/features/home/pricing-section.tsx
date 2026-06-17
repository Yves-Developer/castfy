"use client";

import { Button } from "@castfy/ui/components/button";
import { PlanCards } from "@castfy/ui/components/plan-cards";

export function PricingSection() {
  return (
    <section className="container" id="pricing">
      <div className="mb-12 space-y-4 text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Pricing that matches how you run your business
        </h2>
        <p className="hidden font-sans text-base text-muted-foreground leading-normal sm:block">
          Start simple, upgrade when your workflow gets more complex.
        </p>
      </div>

      <PlanCards
        footnote="14-day free trial"
        renderBusinessAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a
                href="https://waitlist.castfy.app"
                rel="noopener"
                target="_blank"
              >
                Join waiting list
              </a>
            </Button>
            <p className="text-center font-sans text-muted-foreground text-xs">
              Built for high-volume teams
            </p>
          </>
        )}
        renderFreeTrialAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a
                href="https://waitlist.castfy.app"
                rel="noopener"
                target="_blank"
              >
                Join waiting list
              </a>
            </Button>
            <p className="text-center font-sans text-muted-foreground text-xs">
              No credit card required
            </p>
          </>
        )}
        renderProAction={() => (
          <>
            <Button asChild className="w-full text-sm">
              <a
                href="https://waitlist.castfy.app"
                rel="noopener"
                target="_blank"
              >
                Join waiting list
              </a>
            </Button>
            <p className="text-center font-sans text-muted-foreground text-xs">
              Best value for most businesses
            </p>
          </>
        )}
        renderStarterAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a
                href="https://waitlist.castfy.app"
                rel="noopener"
                target="_blank"
              >
                Join waiting list
              </a>
            </Button>
            <p className="text-center font-sans text-muted-foreground text-xs">
              Best for getting started
            </p>
          </>
        )}
      />
    </section>
  );
}
