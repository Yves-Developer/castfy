import { CircleCheckIcon } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment received",
};

/**
 * Where Polar sends people after paying. The plan reaches the app through
 * Polar's webhook, not this page, so it only needs to send them back.
 */
export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <CircleCheckIcon className="size-10 text-emerald-500" />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-medium text-xl">You're all set</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Your plan is active. Go back to the Castfy app — it updates on its own
          within a few seconds.
        </p>
      </div>
    </div>
  );
}
