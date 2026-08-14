"use client";

import type { FunctionReference } from "convex/server";
import { useEffect, useState } from "react";
import { getConvexClient } from "@/lib/convex";

/**
 * Subscribe to a Convex query and re-render when it changes.
 *
 * The rest of this app talks to Convex through the imperative client rather
 * than ConvexProvider, so this keeps one connection and one convention instead
 * of introducing a second client just for components.
 *
 * Returns `undefined` until the first result lands, which callers can treat as
 * the loading state.
 */
export function useConvexQuery<T>(
  query: FunctionReference<"query">,
  args: Record<string, unknown>
): T | undefined {
  const [data, setData] = useState<T>();
  // Subscriptions should re-open when the argument *values* change, not when a
  // caller happens to pass a fresh object literal on every render.
  const argsKey = JSON.stringify(args);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = getConvexClient().onUpdate(
        query,
        JSON.parse(argsKey) as Record<string, unknown>,
        (value) => {
          if (active) {
            setData(value as T);
          }
        }
      );
    } catch (error) {
      // Convex not configured; leave the caller in its loading state rather
      // than taking the page down.
      console.error("Convex subscription failed:", error);
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [query, argsKey]);

  return data;
}
