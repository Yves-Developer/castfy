import { TIERS } from "@castfy/plans";
import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@castfy/ui/components/dialog";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { bridge } from "@/lib/bridge";
import { BetaCodeForm } from "./beta-code";
import { PaymentsSoon, TestModeNote, usePayments } from "./payments-soon";
import { useWatchForPurchase } from "./use-plan";

/**
 * Shown when a recording or export is refused because the account has no
 * plan (limit 0) or used up the free demos it had before Castfy dropped its
 * free tier: buy Castfy, or redeem a beta code. Either one unlocks, and
 * `onUnlocked` runs the export again.
 */
export function UpgradeDialog({
  limit,
  onClose,
  onUnlocked,
}: {
  limit: number | null;
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const payments = usePayments();

  const unlocked = () => {
    setCheckingOut(false);
    onUnlocked();
  };
  useWatchForPurchase(checkingOut, unlocked);

  const buy = async () => {
    setError(null);
    const result = await bridge.checkout("lifetime");
    if (result.ok) {
      setCheckingOut(true);
    } else {
      setError(result.error ?? "Could not start checkout. Try again.");
    }
  };

  const tier = TIERS.lifetime;
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setCheckingOut(false);
          onClose();
        }
      }}
      open={limit !== null}
    >
      <DialogContent className="max-w-100">
        <DialogHeader>
          <DialogTitle>
            {limit
              ? `You've used your ${limit} free demos`
              : payments.open
                ? "Get Castfy to start recording"
                : "Enter your beta code to start recording"}
          </DialogTitle>
          <DialogDescription>
            {payments.open
              ? "Buy Castfy once to make as many demos as you like, without the watermark."
              : "Castfy is in private beta. Enter your code below for unlimited demos, or join the waitlist at castfy.app to get one."}
            {limit
              ? " Demos you already made can still be exported again."
              : null}
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-1.5">
          {tier.features.map((feature) => (
            <li
              className="flex gap-2 text-muted-foreground text-xs"
              key={feature}
            >
              <CheckIcon className="mt-0.5 size-3 flex-none" strokeWidth={3} />
              {feature}
            </li>
          ))}
        </ul>

        {checkingOut ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Loader2Icon className="size-3.5 animate-spin" />
            Finish your purchase in your browser. The export starts by itself
            once it goes through.
          </div>
        ) : null}
        {error ? <p className="text-destructive text-xs">{error}</p> : null}

        {payments.open ? (
          <Button className="h-8 w-full text-xs" onClick={buy} variant="brand">
            {checkingOut ? "Open checkout again" : `Buy Castfy — ${tier.price}`}
          </Button>
        ) : null}
        {payments.open && payments.testMode ? <TestModeNote /> : null}
        {payments.open ? null : (
          <div className="flex flex-col gap-2">
            <Button className="h-8 w-full text-xs" disabled variant="brand">
              Buying opens soon
            </Button>
            <PaymentsSoon />
          </div>
        )}

        <div className="border-t pt-4">
          <BetaCodeForm onRedeemed={unlocked} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
