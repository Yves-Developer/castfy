"use client";

import { Button } from "@castfy/ui/components/button";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

/** The product the site sells: the one-time purchase (@castfy/plans). */
const PRODUCT_SLUG = "lifetime";

/**
 * Starts checkout the way the desktop app does (apps/desktop/account.js):
 * a checkout session for the signed-in user, who is the payment's reference,
 * so the plan lands on their account through Dodo's webhook.
 */
async function startCheckout(userId: string): Promise<string> {
  const response = await fetch("/api/auth/dodopayments/checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ slug: PRODUCT_SLUG, referenceId: userId }),
  });
  const body = (await response.json().catch(() => null)) as {
    url?: string;
  } | null;
  if (!(response.ok && body?.url)) {
    throw new Error(`Couldn't open checkout (${response.status}). Try again.`);
  }
  return body.url;
}

export function BuyRedirect() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const go = useCallback(async (userId: string) => {
    setError(null);
    try {
      const url = await startCheckout(userId);
      // Sent before leaving: the page unloads as checkout opens.
      posthog.capture(
        "checkout_started",
        { from: "website", product: PRODUCT_SLUG },
        { send_instantly: true }
      );
      window.location.assign(url);
    } catch (e) {
      posthog.capture("checkout_failed", {
        from: "website",
        product: PRODUCT_SLUG,
      });
      started.current = false;
      setError(e instanceof Error ? e.message : "Couldn't open checkout.");
    }
  }, []);

  useEffect(() => {
    if (isPending || started.current) {
      return;
    }
    if (!session) {
      // Back here after Google, and on to checkout.
      router.replace("/login?redirect=/buy");
      return;
    }
    started.current = true;
    go(session.user.id);
  }, [go, isPending, router, session]);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      {error ? (
        <>
          <p className="text-destructive text-sm">{error}</p>
          <Button
            onClick={() => {
              if (session) {
                started.current = true;
                go(session.user.id);
              }
            }}
            variant="outline"
          >
            Try again
          </Button>
        </>
      ) : (
        <>
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-sm">Opening checkout…</p>
        </>
      )}
    </div>
  );
}
