import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

/**
 * Better Auth under /api/auth/*: sign-in with Google, the
 * desktop device flow (/device/code, /device/token), the Convex JWT exchange
 * (/convex/token) and, when Dodo Payments is configured, its checkout,
 * customer portal and webhooks under /dodopayments.
 */
authComponent.registerRoutes(http, createAuth);

/** Demo ids are castfy0 session ids: 8 hex characters, or a longer id. */
const DEMO_ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

/**
 * castfy0 asks here: Authorization: Bearer <recorder key>, body {"demoId":
 * "<session id>"}. /recorder/begin before it records (only checks), and
 * /recorder/finish once the demo is made (counts it). Answers what
 * billing.recorderCall does: { allowed, watermark, ... } or { allowed: false,
 * reason }.
 */
for (const stage of ["begin", "finish"] as const) {
  http.route({
    path: `/recorder/${stage}`,
    method: "POST",
    handler: httpAction(async (ctx, request) => {
      const header = request.headers.get("authorization") ?? "";
      const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
      const body = (await request.json().catch(() => null)) as {
        demoId?: unknown;
      } | null;
      const demoId = typeof body?.demoId === "string" ? body.demoId : "";
      if (!(key && DEMO_ID_PATTERN.test(demoId))) {
        return Response.json(
          { allowed: false, reason: "bad_request" },
          { status: 400 }
        );
      }
      const result = await ctx.runMutation(internal.billing.recorderCall, {
        keyHash: await sha256Hex(key),
        demoId,
        stage,
      });
      return Response.json(result);
    }),
  });
}

export default http;
