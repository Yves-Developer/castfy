import type { NextRequest } from "next/server";

// Streaming proxy to the playground demo-recording service.
//
// It exists so the playground's shared secret stays server-side. Calling the
// playground straight from the browser would mean shipping the token in a
// NEXT_PUBLIC_* var — readable by anyone who opens devtools, which is not
// authentication at all.
//
// `dynamic`, `revalidate`, and `fetchCache` are NOT valid here: Next 16 removes
// those segment-config options when `cacheComponents` is enabled, and this app
// sets `cacheComponents: true` in next.config.ts. Reading `request.nextUrl`
// below is what makes this handler run per request.
export const runtime = "nodejs";

// A recording runs well past any default serverless limit. Keep this above the
// playground's own JOB_TIMEOUT_MS (40 min) so the platform doesn't cut the
// stream before the job itself gives up.
export const maxDuration = 2700;

const PLAYGROUND_API_URL =
  process.env.PLAYGROUND_API_URL ??
  process.env.NEXT_PUBLIC_PLAYGROUND_API_URL ??
  "http://localhost:4000";

/**
 * Only these reach the playground. An allowlist rather than forwarding the
 * whole query string, so a caller can't smuggle in parameters the UI never
 * offers.
 */
const FORWARDED_PARAMS = ["url", "promptGoal", "headless"] as const;

/**
 * ⚠️ This dashboard currently has no session layer, so this proxy is reachable
 * by anyone who can reach the dashboard. It narrows exposure (the playground
 * token is no longer in the browser bundle) but it is NOT a substitute for
 * authentication.
 *
 * When a session layer lands, check it here — this is the single chokepoint for
 * every demo generation, and returning a Response short-circuits the run.
 */
function checkAuthorized(_request: NextRequest): Response | null {
  return null;
}

export async function GET(request: NextRequest): Promise<Response> {
  const unauthorized = checkAuthorized(request);
  if (unauthorized) {
    return unauthorized;
  }

  const token = process.env.PLAYGROUND_API_TOKEN;
  const incoming = request.nextUrl.searchParams;
  const forwarded = new URLSearchParams();

  for (const key of FORWARDED_PARAMS) {
    const value = incoming.get(key);
    if (value !== null) {
      forwarded.set(key, value);
    }
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${PLAYGROUND_API_URL}/api/generate?${forwarded.toString()}`,
      {
        headers: token ? { authorization: `Bearer ${token}` } : undefined,
        // Never let the framework buffer or cache a long-lived event stream.
        cache: "no-store",
        // Propagates browser disconnects to the playground, which aborts the
        // run and tears down its browser rather than billing on for nobody.
        signal: request.signal,
      }
    );
  } catch (error) {
    // The playground being down or unreachable. Match the { error } body shape
    // the client already parses for non-SSE failures.
    const message =
      error instanceof Error ? error.message : "Failed to reach playground";
    return Response.json(
      { error: `Playground unreachable: ${message}` },
      { status: 502 }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const body = await upstream.text();
    return new Response(body || JSON.stringify({ error: upstream.statusText }), {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "application/json",
      },
    });
  }

  // Hand the upstream stream straight through rather than pumping it manually —
  // no buffering, no extra copy, back-pressure preserved.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform, no-store, must-revalidate",
      connection: "keep-alive",
      // Stops nginx and similar proxies buffering the stream into silence.
      "x-accel-buffering": "no",
      "x-content-type-options": "nosniff",
    },
  });
}
