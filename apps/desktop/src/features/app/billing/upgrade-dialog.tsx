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
import { useWatchForPurchase } from "./use-plan";

/**
 * Shown when an export is refused because the free demos are used up: buy
 * Castfy, or redeem a beta code. Either one unlocks, and `onUnlocked` runs
 * the export again.
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
          <DialogTitle>You've used your {limit} free demos</DialogTitle>
          <DialogDescription>
            Buy Castfy once to export as many demos as you like. Demos you
            already exported can still be exported again.
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

        <Button className="h-8 w-full text-xs" onClick={buy}>
          {checkingOut ? "Open checkout again" : `Buy Castfy — ${tier.price}`}
        </Button>

        <div className="border-t pt-4">
          <BetaCodeForm onRedeemed={unlocked} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
