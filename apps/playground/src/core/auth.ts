import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const BEARER_PREFIX = "Bearer ";

/**
 * Shared secret for server-to-server callers. A demo run drives a real browser
 * and spends real Anthropic credits, so this endpoint must never be reachable
 * anonymously in production.
 */
function readConfiguredToken(): string | undefined {
  const token = process.env.PLAYGROUND_API_TOKEN?.trim();
  return token ? token : undefined;
}

/**
 * Refuse to boot a production process that would serve demo generation to
 * anyone who finds the URL. Failing at startup is far better than discovering
 * the gap from a billing alert.
 */
export function assertAuthConfigured(): void {
  if (process.env.NODE_ENV === "production" && !readConfiguredToken()) {
    throw new Error(
      "PLAYGROUND_API_TOKEN must be set when NODE_ENV=production. " +
        "Refusing to start an unauthenticated demo-generation endpoint."
    );
  }
}

function tokensMatch(provided: string, expected: string): boolean {
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, which would itself leak length.
  if (providedBytes.length !== expectedBytes.length) {
    return false;
  }
  return timingSafeEqual(providedBytes, expectedBytes);
}

/**
 * Bearer-token gate. Outside production an unset token leaves the endpoint open
 * so local dashboard development keeps working without extra setup; startup
 * logs a warning so that state is never a surprise.
 */
export function requireApiToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expected = readConfiguredToken();
  if (!expected) {
    next();
    return;
  }

  const header = req.get("authorization");
  if (!header?.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  if (!tokensMatch(header.slice(BEARER_PREFIX.length).trim(), expected)) {
    res.status(403).json({ error: "Invalid bearer token" });
    return;
  }

  next();
}

/**
 * Comma-separated origin allowlist. Returning `false` (rather than `true`) for
 * an unset value means a misconfigured deploy blocks browsers instead of
 * echoing arbitrary origins back.
 */
export function parseAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isAuthConfigured(): boolean {
  return readConfiguredToken() !== undefined;
}
