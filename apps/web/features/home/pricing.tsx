"use client";

import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { useMediaQuery } from "@workspace/ui/hooks/use-media-query";
import { Check } from "lucide-react";
import { motion } from "motion/react";

const features = [
  "Unlimited clients",
  "Proposal & deal tracking",
  "Client notes and history",
  "Tasks and followups",
  "Team collaboration",
  "Email support",
  "No sales pipelines or setup required",
];

export function HomePricing() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  return (
    <motion.div
      className="mx-auto w-full max-w-7xl rounded-4xl px-6 pt-16 pb-8 md:px-12 md:py-20"
      initial={{ opacity: 0, y: 20 }}
      style={{
        backgroundImage: isMobile
          ? "url('/pricing-mobile.svg')"
          : "url('/pricing.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      viewport={{ once: true, amount: 0.15 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 flex flex-col items-center text-center">
          <h2 className="font-medium text-3xl text-white tracking-tight sm:text-4xl">
            Run your consulting business with less overhead
          </h2>
          <p className="mt-4 text-sm text-white/70 sm:text-base">
            With Axis, you never have to learn a new tool. Use what you want.
          </p>
        </div>

        <Card className="overflow-hidden rounded-2xl border-0 bg-background/85 p-0 shadow-xl">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-col border-border/30 border-b p-8 md:basis-2/5 md:border-r md:border-b-0 md:p-10">
              <h3 className="text-center font-medium text-4xl text-foreground">
                Axis
              </h3>
              <p className="mt-1 text-center text-lg text-muted-foreground">
                For independent consultants
                <br />
                and small teams
              </p>

              <p className="mt-8 text-center font-medium text-foreground text-xl">
                $39 per user / month
              </p>

              <div className="mt-8 flex flex-col gap-3">
                <Button className="w-full rounded-full">Get started</Button>
                <Button
                  className="w-full rounded-full border-foreground/20 bg-transparent"
                  variant="outline"
                >
                  Book a demo
                </Button>
              </div>

              <p className="mt-8 text-center font-light text-muted-foreground text-sm">
                Includes all features, updates, and future
                <br />
                improvements.
              </p>
            </div>

            <div className="flex flex-col justify-between p-8 md:basis-3/5 md:p-10">
              <ul className="flex flex-col gap-3">
                {features.map((feature, i) => (
                  <li className="flex items-center gap-3" key={i}>
                    <Check
                      className="h-4 w-4 text-foreground"
                      strokeWidth={2}
                    />
                    <span className="font-medium text-foreground text-sm">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-border/30 border-t pt-6">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Axis is designed for relationship-driven work. Manage clients,
                  track deals, and stay on top of follow-ups—without the
                  complexity of traditional CRMs. Companies using our platform
                  include:
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
