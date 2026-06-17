"use client";

import { Button } from "@castfy/ui/components/button";
import { PlanCards } from "@castfy/ui/components/plan-cards";

export function PricingSection() {
  return (
    <section className="container" id="pricing">
      <div className="text-center space-y-4 mb-12">
        <h2 className="font-serif text-3xl sm:text-4xl text-foreground">
          Pricing that matches how you run your business
        </h2>
        <p className="hidden sm:block font-sans text-base text-muted-foreground leading-normal">
          Start simple, upgrade when your workflow gets more complex.
        </p>
      </div>

      <PlanCards
        footnote="14-day free trial"
        renderFreeTrialAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a
                href="https://waitlist.castfy.app"
                target="_blank"
                rel="noopener"
              >
                Join waiting list
              </a>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center">
              No credit card required
            </p>
          </>
        )}
        renderStarterAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a
                href="https://waitlist.castfy.app"
                target="_blank"
                rel="noopener"
              >
                Join waiting list
              </a>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center">
              Best for getting started
            </p>
          </>
        )}
        renderProAction={() => (
          <>
            <Button asChild className="w-full text-sm">
              <a
                href="https://waitlist.castfy.app"
                target="_blank"
                rel="noopener"
              >
                Join waiting list
              </a>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center">
              Best value for most businesses
            </p>
          </>
        )}
        renderBusinessAction={() => (
          <>
            <Button asChild className="w-full text-sm" variant="outline">
              <a
                href="https://waitlist.castfy.app"
                target="_blank"
                rel="noopener"
              >
                Join waiting list
              </a>
            </Button>
            <p className="font-sans text-xs text-muted-foreground text-center">
              Built for high-volume teams
            </p>
          </>
        )}
      />
    </section>
  );
}
