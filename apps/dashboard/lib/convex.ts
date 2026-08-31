import { ConvexClient } from "convex/browser";

/**
 * Lazily-created browser client. Instantiating at module scope would run during
 * prerender, where `window` and the env var may not be what we want.
 */
let cached: ConvexClient | undefined;

export function getConvexClient(): ConvexClient {
  if (cached) {
    return cached;
  }
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is not set. Run `pnpm dev` in packages/backend " +
        "to provision a deployment, then copy the URL into apps/dashboard/.env."
    );
  }
  cached = new ConvexClient(url);
  return cached;
}
