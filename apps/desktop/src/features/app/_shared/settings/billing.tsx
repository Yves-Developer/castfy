import { FREE_DEMO_LIMIT, TIERS } from "@castfy/plans";
import { Badge } from "@castfy/ui/components/badge";
import { Button } from "@castfy/ui/components/button";
import { CheckIcon, ExternalLinkIcon, Loader2Icon } from "lucide-react";
import { useCallback, useState } from "react";
import { BetaCodeForm } from "@/features/app/billing/beta-code";
import { usePlan, useWatchForPurchase } from "@/features/app/billing/use-plan";
import { type AccountPlan, bridge } from "@/lib/bridge";

/** "Mar 3, 2027" for a timestamp in ms. */
function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * The account's plan: what it is, the free demos used, and what can be done
 * about it (buy Castfy, redeem a beta code, see receipts).
 */
export function AccountBilling() {
  const { plan, loading, error, refresh } = usePlan();
  const [checkingOut, setCheckingOut] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const bought = useCallback(() => {
    setCheckingOut(false);
    refresh();
  }, [refresh]);
  useWatchForPurchase(checkingOut, bought);

  const buy = async () => {
    setActionError(null);
    const result = await bridge.checkout("lifetime");
    if (result.ok) {
      setCheckingOut(true);
    } else {
      setActionError(result.error ?? "Could not start checkout. Try again.");
    }
  };

  const manage = async () => {
    setActionError(null);
    const result = await bridge.billingPortal();
    if (!result.ok) {
      setActionError(
        result.error ?? "Could not open your purchases. Try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-muted-foreground text-xs">
        <Loader2Icon className="size-3.5 animate-spin" />
        Loading your plan…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="mx-auto flex h-full max-w-sm flex-col items-center justify-center gap-3 text-center">
        <p className="text-muted-foreground text-xs">
          {error ?? "Sign in to see your plan."}
        </p>
        {error ? (
          <Button
            className="h-8 text-xs"
            onClick={refresh}
            size="sm"
            variant="secondary"
          >
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  const key = plan.plan.key;

  return (
    <div className="flex flex-col gap-6">
      <PlanSummary plan={plan} />

      {key === "lifetime" ? (
        <Button
          className="h-8 self-start text-xs"
          onClick={manage}
          variant="secondary"
        >
          Receipts and refunds
          <ExternalLinkIcon className="size-3" />
        </Button>
      ) : (
        <BuyCard checkingOut={checkingOut} onBuy={buy} />
      )}

      {key === "free" ? <BetaCodeForm onRedeemed={refresh} /> : null}

      {actionError ? (
        <p className="text-destructive text-xs">{actionError}</p>
      ) : null}
    </div>
  );
}

/** The plan's name, and what it gives: demos used, or until when. */
function PlanSummary({ plan }: { plan: AccountPlan }) {
  const key = plan.plan.key;
  const used = plan.usage.demos;
  const limit = plan.limits.demos === "unlimited" ? null : plan.limits.demos;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <p className="font-medium text-sm">{plan.plan.name}</p>
        <Badge className="text-[10px]" variant="secondary">
          {key === "free" ? "Current plan" : "Active"}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs">
        {key === "lifetime" && "Unlimited demos. Thank you for buying Castfy."}
        {key === "beta" &&
          (plan.plan.betaEndsAt
            ? `Unlimited demos with your beta code, until ${formatDate(plan.plan.betaEndsAt)}.`
            : "Unlimited demos with your beta code, while the beta runs.")}
        {key === "free" &&
          `${used} of ${limit ?? FREE_DEMO_LIMIT} free demos exported. A demo counts once, however often you export it.`}
      </p>
      {key === "free" && limit ? (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-foreground/70"
            style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
          />
        </div>
      ) : null}
      {key === "beta" && plan.plan.betaCode ? (
        <p className="font-mono text-[11px] text-muted-foreground">
          {plan.plan.betaCode}
        </p>
      ) : null}
    </div>
  );
}

/** Castfy, priced, with a Buy button: on the Free and Beta plans. */
function BuyCard({
  checkingOut,
  onBuy,
}: {
  checkingOut: boolean;
  onBuy: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-medium text-[13px]">{TIERS.lifetime.title}</p>
        <p className="font-medium text-sm">{TIERS.lifetime.price}</p>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {TIERS.lifetime.description}
      </p>
      <ul className="flex flex-col gap-1.5">
        {TIERS.lifetime.features.map((feature) => (
          <li
            className="flex gap-2 text-[11px] text-muted-foreground"
            key={feature}
          >
            <CheckIcon className="mt-0.5 size-3 flex-none" strokeWidth={3} />
            {feature}
          </li>
        ))}
      </ul>
      {checkingOut ? (
        <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Loader2Icon className="size-3 animate-spin" />
          Finish your purchase in your browser; this page updates by itself.
        </p>
      ) : null}
      <Button className="h-8 text-xs" onClick={onBuy} variant="brand">
        {checkingOut
          ? "Open checkout again"
          : `Buy Castfy — ${TIERS.lifetime.price}`}
      </Button>
    </div>
  );
}
