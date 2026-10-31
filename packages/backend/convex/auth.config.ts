import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

/**
 * Trusts the JWTs Better Auth mints at /api/auth/convex/token. Without this
 * file ctx.auth.getUserIdentity() is always null, with no error to say why.
 */
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
