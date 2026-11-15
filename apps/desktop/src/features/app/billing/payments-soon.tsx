import { usePlan } from "./use-plan";

/**
 * Whether this account can buy Castfy from the app, as the backend says
 * (billing.me checkout): open for everyone in Dodo's live mode, and in test
 * mode only for the addresses in DODO_TEST_BUYERS. While closed, every Buy
 * button says buying opens soon and points to beta codes. Going live needs no
 * app release, only Convex settings.
 */
export function usePayments() {
  const { plan } = usePlan();
  return {
    open: plan?.checkout?.open === true,
    testMode: plan?.checkout?.testMode === true,
  };
}

/** Shown under a Buy button while buying is closed. */
export function PaymentsSoon({ className }: { className?: string }) {
  return (
    <p
      className={`text-center text-[11px] text-muted-foreground ${className ?? ""}`}
    >
      Buying Castfy opens soon. During the beta, a beta code makes it free and
      unlimited.
    </p>
  );
}

/** Shown under the Buy button in Dodo's test mode: no real money moves. */
export function TestModeNote() {
  return (
    <p className="text-center text-[11px] text-amber-600 dark:text-amber-400">
      Test mode: pay with a Dodo test card. No real money is charged.
    </p>
  );
}
