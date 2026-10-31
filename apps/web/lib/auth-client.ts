import { deviceAuthorizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * Talks to /api/auth on this site, which app/api/auth/[...all] forwards to
 * the Convex backend. Same origin, so the session cookie is castfy.app's.
 */
export const authClient = createAuthClient({
  plugins: [deviceAuthorizationClient()],
});

/**
 * Where to go after signing in. Only same-site paths: an absolute or
 * protocol-relative URL here would make /login an open redirect.
 */
export function safeRedirect(target: string | null): string {
  if (!target?.startsWith("/") || target.startsWith("//")) {
    return "/";
  }
  return target;
}
