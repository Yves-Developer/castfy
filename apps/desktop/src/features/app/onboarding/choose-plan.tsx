import { type PlanTier, TIERS } from "@castfy/plans";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { BetaCodeForm } from "@/features/app/billing/beta-code";
import { bridge } from "@/lib/bridge";
import {
  PaymentsSoon,
  TestModeNote,
  usePayments,
} from "../billing/payments-soon";

/** How often to look for the purchase while checkout is open. */
const CHECKOUT_POLL_MS = 4000;

/** Where people without a beta code get one. */
const WAITLIST_URL = "https://waitlist.castfy.app";

/**
 * Onboarding's plan step, after sign-in, priced as on the website: a beta
 * code, or Castfy for one payment. There is no free tier, so this is how an
 * account gets to record. Redeeming moves on at once; buying opens Dodo
 * checkout in the browser and the step waits until the purchase reaches the
 * backend (Dodo's webhook), then moves on by itself. "Not now" moves on
 * without a plan: the library opens, and recording asks again. Shown once:
 * answering it sets settings.planChosen.
 */
export function ChoosePlan({ onDone }: { onDone: () => void }) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payments = usePayments();

  const finish = useCallback(async () => {
    await bridge.setSettings({ planChosen: true });
    onDone();
  }, [onDone]);

  const hasBought = useCallback(async () => {
    const result = await bridge.plan();
    return result.ok && result.plan?.plan.key === "lifetime";
  }, []);

  // Someone who already bought, or redeemed a beta code (on another
  // computer, or before reinstalling), has nothing to choose.
  useEffect(() => {
    bridge.plan().then((result) => {
      if (result.ok && result.plan && result.plan.plan.key !== "free") {
        finish();
      }
    });
  }, [finish]);

  // While checkout is open in the browser, watch for the purchase to land.
  useEffect(() => {
    if (!checkingOut) {
      return;
    }
    const timer = setInterval(async () => {
      if (await hasBought()) {
        clearInterval(timer);
        finish();
      }
    }, CHECKOUT_POLL_MS);
    return () => clearInterval(timer);
  }, [checkingOut, hasBought, finish]);

  const buy = async () => {
    setStarting(true);
    setError(null);
    const result = await bridge.checkout("lifetime");
    setStarting(false);
    if (!result.ok) {
      setError(result.error ?? "Could not start checkout. Try again.");
      return;
    }
    setCheckingOut(true);
  };

  if (checkingOut) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex w-full max-w-100 flex-col items-center gap-6 text-center">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-semibold text-lg tracking-tight">
              Finish your purchase in your browser
            </h1>
            <p className="text-balance text-muted-foreground text-sm">
              Castfy moves on by itself once your payment goes through.
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2Icon className="size-3.5 animate-spin" />
            Waiting for your payment…
          </div>
          <div className="flex gap-2">
            <Button className="h-8 text-xs" onClick={buy} variant="secondary">
              Open checkout again
            </Button>
            <Button
              className="h-8 text-xs"
              onClick={() => setCheckingOut(false)}
              variant="ghost"
            >
              Back
            </Button>
          </div>
          <button
            className="text-[11px] text-muted-foreground underline hover:text-foreground"
            onClick={finish}
            type="button"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <header className="flex max-w-125 flex-col items-center gap-1.5 text-center">
        <h1 className="font-semibold text-lg tracking-tight">
          Castfy is in private beta
        </h1>
        <p className="text-balance text-muted-foreground text-sm">
          Enter your beta code for unlimited demos while the beta runs, or buy
          Castfy once. You can do either later in Settings → Billing.
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3.5 py-2.5 text-xs">
          {error}
        </p>
      ) : null}

      <div className="grid w-full max-w-200 grid-cols-1 rounded-xl border md:grid-cols-2">
        <TierCard tier={TIERS.free}>
          <div className="flex flex-col gap-2">
            <BetaCodeForm onRedeemed={finish} />
            <button
              className="self-start text-[11px] text-muted-foreground underline hover:text-foreground"
              onClick={() => bridge.openExternal(WAITLIST_URL)}
              type="button"
            >
              No code yet? Join the waitlist
            </button>
          </div>
        </TierCard>
        <TierCard
          className="border-t md:border-t-0 md:border-l"
          tier={TIERS.lifetime}
        >
          {payments.open ? (
            <div className="flex flex-col gap-2">
              <Button
                className="h-8 w-full text-xs"
                disabled={starting}
                onClick={buy}
                variant="brand"
              >
                {starting ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : null}
                Buy Castfy — {TIERS.lifetime.price}
              </Button>
              {payments.testMode ? <TestModeNote /> : null}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Button className="h-8 w-full text-xs" disabled variant="brand">
                Buying opens soon
              </Button>
              <PaymentsSoon />
            </div>
          )}
        </TierCard>
      </div>

      <p className="max-w-125 text-balance text-center text-[11px] text-muted-foreground">
        Recordings run on your own Claude, Codex or Cursor subscription. A demo
        spends quota you already pay for, not money.
      </p>

      <button
        className="text-[11px] text-muted-foreground underline hover:text-foreground"
        onClick={finish}
        type="button"
      >
        Not now
      </button>
    </div>
  );
}

function TierCard({
  tier,
  className,
  children,
}: {
  tier: PlanTier;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-4 p-5", className)}>
      <div className="flex flex-col gap-1">
        <h2 className="font-medium text-sm">{tier.title}</h2>
        <p className="text-muted-foreground text-xs">{tier.description}</p>
      </div>
      <p className="border-y py-3 font-medium text-lg">{tier.price}</p>
      <ul className="flex flex-1 flex-col gap-2">
        {tier.features.map((feature) => (
          <li
            className="flex items-start gap-2 text-muted-foreground text-xs leading-5"
            key={feature}
          >
            <CheckIcon className="mt-1 size-3 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}
