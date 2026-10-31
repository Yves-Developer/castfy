import { useCallback, useEffect, useState } from "react";
import { type AccountPlan, bridge } from "@/lib/bridge";

/**
 * The account's plan, limits and usage, read from the backend. `refresh`
 * reads it again, after a purchase or a beta code.
 */
export function usePlan() {
  const [plan, setPlan] = useState<AccountPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await bridge.plan();
    if (result.ok) {
      setPlan(result.plan);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
    return result.ok ? result.plan : null;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { plan, loading, error, refresh };
}

/** How often to look for a purchase while checkout is open in the browser. */
export const CHECKOUT_POLL_MS = 4000;

/**
 * Calls `onBought` once the account owns Castfy, checking every few seconds
 * while `watching`: the purchase arrives through Dodo's webhook, not here.
 */
export function useWatchForPurchase(watching: boolean, onBought: () => void) {
  useEffect(() => {
    if (!watching) {
      return;
    }
    const timer = setInterval(async () => {
      const result = await bridge.plan();
      if (result.ok && result.plan?.plan.key === "lifetime") {
        clearInterval(timer);
        onBought();
      }
    }, CHECKOUT_POLL_MS);
    return () => clearInterval(timer);
  }, [watching, onBought]);
}
