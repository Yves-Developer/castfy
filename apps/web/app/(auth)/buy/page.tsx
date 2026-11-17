import type { Metadata } from "next";
import { BuyRedirect } from "@/features/billing/buy-redirect";

export const metadata: Metadata = {
  title: "Buy Castfy",
};

/**
 * castfy.app/buy: the pricing card's button. Signs the visitor in with
 * Google if needed, then sends them to Dodo checkout for Castfy. The purchase
 * belongs to that Google account, so signing in to the app with it unlocks it.
 */
export default function BuyPage() {
  return <BuyRedirect />;
}
