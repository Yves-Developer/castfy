"use client";

import {
  businessFeatures,
  freeTrialFeatures,
  getPlanPricing,
  type PlanFeature,
  proFeatures,
  starterFeatures,
} from "@castfy/plans";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@castfy/ui/components/tooltip";
import { cn } from "@castfy/ui/lib/utils";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function FeatureRow({ label, tooltip, disabled }: PlanFeature) {
  const content = (
    <div className="flex items-start gap-2">
      <span
        className={cn(
          "leading-6",
          disabled ? "text-muted-foreground/40" : "text-foreground"
        )}
      >
        •
      </span>
      <span
        className={cn(
          "font-sans text-sm leading-relaxed",
          disabled ? "text-muted-foreground/50" : "text-foreground",
          tooltip && "cursor-help border-[#878787]/30 border-b border-dashed"
        )}
      >
        {label}
      </span>
    </div>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent className="max-w-70 text-xs">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface PlanCardsProps {
  continent?: string;
  footnote?: string;
  onCurrencyChange?: (currency: "USD" | "EUR") => void;
  renderBusinessAction: (billingPeriod: "monthly" | "yearly") => ReactNode;
  renderFreeTrialAction: () => ReactNode;
  renderProAction: (billingPeriod: "monthly" | "yearly") => ReactNode;
  renderStarterAction: (billingPeriod: "monthly" | "yearly") => ReactNode;
}

export function PlanCards({
  continent,
  renderFreeTrialAction,
  renderStarterAction,
  renderProAction,
  renderBusinessAction,
  onCurrencyChange,
  footnote,
}: PlanCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [currency, setCurrency] = useState<"USD" | "EUR">(() => {
    if (continent) {
      return getPlanPricing(continent).currency as "USD" | "EUR";
    }
    return "USD";
  });
  const pricing = getPlanPricing(currency === "EUR" ? "EU" : "NA");

  useEffect(() => {
    if (continent) {
      return;
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz?.startsWith("Europe/")) {
        setCurrency("EUR");
        onCurrencyChange?.("EUR");
      }
    } catch {
      // Ignore error and default to USD
    }
  }, [continent, onCurrencyChange]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="w-full">
        <div className="mb-6 flex justify-center sm:mb-6 lg:mb-12">
          <div
            className="relative flex items-stretch rounded-lg bg-muted"
            style={{ width: "fit-content" }}
          >
            <div className="flex items-stretch">
              <button
                className={`group relative flex h-9 touch-manipulation items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[14px] transition-colors focus:outline-none focus-visible:outline-none ${
                  billingPeriod === "monthly"
                    ? "border-border bg-background text-foreground"
                    : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setBillingPeriod("monthly")}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  marginBottom: billingPeriod === "monthly" ? "-1px" : "0px",
                  position: "relative",
                  zIndex: billingPeriod === "monthly" ? 10 : 1,
                }}
                type="button"
              >
                <span>Monthly</span>
              </button>
              <button
                className={`group relative flex h-9 touch-manipulation items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-[14px] transition-colors focus:outline-none focus-visible:outline-none ${
                  billingPeriod === "yearly"
                    ? "border-border bg-background text-foreground"
                    : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setBillingPeriod("yearly")}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  marginBottom: billingPeriod === "yearly" ? "-1px" : "0px",
                  position: "relative",
                  zIndex: billingPeriod === "yearly" ? 10 : 1,
                }}
                type="button"
              >
                <span>Yearly (Save 20%)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Free Trial Plan */}
          <div className="flex h-full flex-col rounded-lg border border-border bg-background p-4 py-6">
            <div className="mb-4">
              <h3 className="mb-1 font-sans text-base text-foreground">
                Free Trial
              </h3>
              <p className="mb-3 font-sans text-muted-foreground text-sm">
                Try it out, no commitment
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-2xl text-foreground">
                  {pricing.symbol}0
                </span>
                <span className="font-sans text-muted-foreground text-sm">
                  /3 days
                </span>
              </div>
              <p className="mt-1 font-sans text-muted-foreground text-xs">
                No credit card required
              </p>
            </div>

            <div className="flex-1 space-y-1 border-border border-t pt-8 pb-6">
              {freeTrialFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </div>

            <div className="space-y-3">{renderFreeTrialAction()}</div>
          </div>

          {/* Starter Plan */}
          <div className="flex h-full flex-col rounded-lg border border-border bg-background p-4 py-6">
            <div className="mb-4">
              <h3 className="mb-1 font-sans text-base text-foreground">
                Starter
              </h3>
              <p className="mb-3 font-sans text-muted-foreground text-sm">
                Everything you need to get going
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-2xl text-foreground">
                  {pricing.symbol}
                  {billingPeriod === "monthly"
                    ? pricing.starter.monthly
                    : pricing.starter.yearly}
                </span>
                <span className="font-sans text-muted-foreground text-sm">
                  /month
                </span>
              </div>
              <p className="mt-1 font-sans text-muted-foreground text-xs">
                {billingPeriod === "monthly"
                  ? "Billed monthly"
                  : `${pricing.symbol}${pricing.starter.yearly * 12}/year · billed annually`}
              </p>
            </div>

            <div className="flex-1 space-y-1 border-border border-t pt-8 pb-6">
              {starterFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </div>

            <div className="space-y-3">
              {renderStarterAction(billingPeriod)}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative flex h-full flex-col rounded-lg border border-primary bg-background p-4 py-6">
            <div className="absolute top-0 right-4 -translate-y-1/2">
              <div className="flex items-center justify-center rounded-full border border-primary bg-background px-2 py-1">
                <span className="font-sans text-foreground text-xs">
                  Most popular
                </span>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="mb-1 font-sans text-base text-foreground">Pro</h3>
              <p className="mb-3 font-sans text-muted-foreground text-sm">
                More power as your business grows
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-2xl text-foreground">
                  {pricing.symbol}
                  {billingPeriod === "monthly"
                    ? pricing.pro.monthly
                    : pricing.pro.yearly}
                </span>
                <span className="font-sans text-muted-foreground text-sm">
                  /month
                </span>
              </div>
              <p className="mt-1 font-sans text-muted-foreground text-xs">
                {billingPeriod === "monthly"
                  ? "Billed monthly"
                  : `${pricing.symbol}${pricing.pro.yearly * 12}/year · billed annually`}
              </p>
            </div>

            <div className="flex-1 space-y-1 border-border border-t pt-8 pb-6">
              {proFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </div>

            <div className="space-y-3">{renderProAction(billingPeriod)}</div>
          </div>

          {/* Business Plan */}
          <div className="flex h-full flex-col rounded-lg border border-border bg-background p-4 py-6">
            <div className="mb-4">
              <h3 className="mb-1 font-sans text-base text-foreground">
                Business
              </h3>
              <p className="mb-3 font-sans text-muted-foreground text-sm">
                Built for high-volume teams
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-2xl text-foreground">
                  {pricing.symbol}
                  {billingPeriod === "monthly"
                    ? pricing.business.monthly
                    : pricing.business.yearly}
                </span>
                <span className="font-sans text-muted-foreground text-sm">
                  /month
                </span>
              </div>
              <p className="mt-1 font-sans text-muted-foreground text-xs">
                {billingPeriod === "monthly"
                  ? "Billed monthly"
                  : `${pricing.symbol}${pricing.business.yearly * 12}/year · billed annually`}
              </p>
            </div>

            <div className="flex-1 space-y-1 border-border border-t pt-8 pb-6">
              {businessFeatures.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </div>

            <div className="space-y-3">
              {renderBusinessAction(billingPeriod)}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center font-sans text-muted-foreground text-xs">
          {footnote && <>{footnote} · </>}
          {billingPeriod === "yearly" && <>30-day money-back guarantee · </>}
          <button
            className={cn(
              "transition-colors",
              currency === "USD"
                ? "text-muted-foreground underline underline-offset-4"
                : "cursor-pointer text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              if (currency !== "USD") {
                setCurrency("USD");
                onCurrencyChange?.("USD");
              }
            }}
            type="button"
          >
            USD
          </button>
          {" / "}
          <button
            className={cn(
              "transition-colors",
              currency === "EUR"
                ? "text-muted-foreground underline underline-offset-4"
                : "cursor-pointer text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              if (currency !== "EUR") {
                setCurrency("EUR");
                onCurrencyChange?.("EUR");
              }
            }}
            type="button"
          >
            EUR
          </button>
          {" · Excl. tax"}
        </p>
      </div>
    </TooltipProvider>
  );
}
