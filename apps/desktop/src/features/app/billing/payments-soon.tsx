/**
 * Whether Castfy can be bought from the app. Off while checkout is being set
 * up: every Buy button then says buying opens soon and points to beta codes,
 * instead of opening a checkout that fails. Turn on once Dodo Payments works
 * end to end (checkout, webhook, plan unlocked).
 */
export const PAYMENTS_OPEN = false;

/** Shown under a Buy button while PAYMENTS_OPEN is off. */
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
