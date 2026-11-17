import { CircleCheckIcon } from "lucide-react";
import type { Metadata } from "next";
import { DownloadButton } from "@/components/download-button";

export const metadata: Metadata = {
  title: "Payment received",
};

/**
 * Where Dodo Payments sends people after paying. The plan reaches the app
 * through Dodo's webhook, not this page, so it only needs to send them back.
 */
export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <CircleCheckIcon className="size-10 text-emerald-500" />
      <div className="flex flex-col gap-1.5">
        <h1 className="font-medium text-xl">You're all set</h1>
        <p className="text-balance text-muted-foreground text-sm">
          Your plan is active. If you bought from the Castfy app, go back to it:
          it updates on its own within a few seconds. New to Castfy? Download it
          and sign in with the same Google account.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <DownloadButton />
      </div>
    </div>
  );
}
