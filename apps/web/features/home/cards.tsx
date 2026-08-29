"use client";

import { Button } from "@castfy/ui/components/button";
import { Label } from "@castfy/ui/components/label";
import { Separator } from "@castfy/ui/components/separator";
import { Switch } from "@castfy/ui/components/switch";
import { cn } from "@castfy/ui/lib/utils";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { plans } from "@/config/data";

export function PricingCards() {
  const [yearly, setYearly] = useState<boolean>(true);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-end">
        <div className="flex items-center space-x-2">
          <Label
            className="font-medium text-muted-foreground text-sm"
            htmlFor="yearly"
          >
            Yearly billing
          </Label>
          <Switch
            checked={yearly}
            id="yearly"
            onCheckedChange={(value) => setYearly(value as boolean)}
            size="sm"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-y-6 rounded-xl border lg:grid-cols-3">
        {plans.map((plan, i) => (
          <div
            className={cn(
              "flex flex-1 flex-col gap-1.25 p-5",
              i === 1 && "border-y lg:border-x lg:border-y-0"
            )}
            key={plan.title}
          >
            <div className="text-lg leading-6">
              <p>{plan.title}</p>
              <p className="text-muted-foreground">{plan.desc}</p>
            </div>
            <div className="flex h-7.5 items-center">
              <Separator />
            </div>
            <p className="text-lg">
              {plan.price
                ? `${plan.price[yearly ? "yearly" : "monthly"]}`
                : "Custom quote"}{" "}
              <span className="text-muted-foreground text-sm">per month</span>
            </p>
            <div className="rounded-xl border px-2.5 py-2 text-foreground/80 text-sm">
              {plan.credits} credits{" "}
              {plan.slug === "free" ? "to try" : "/ month"}
            </div>
            <div className="flex h-7.5 items-center">
              <Separator />
            </div>
            <div className="flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <div
                  className="flex items-center gap-2.5 text-muted-foreground leading-5"
                  key={f}
                >
                  <CheckIcon className="size-3" />
                  <p className="">{f}</p>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-5">
              <Button
                asChild
                className="w-full"
                size="lg"
                variant={plan.slug === "pro" ? "default" : "secondary"}
              >
                <Link href="/">{plan.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex flex-wrap items-center justify-between gap-5 rounded-xl border p-5"
        id="enterprise"
      >
        <div>
          <p className="font-medium">Enterprise</p>
          <p className="text-muted-foreground tracking-tight">
            Custom limits, enterprise security, and dedicated support.
          </p>
        </div>

        <Button variant="secondary">Request Trial</Button>
      </div>
    </div>
  );
}
