import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

/**
 * Forwards /api/auth/* to Better Auth on the Convex backend
 * (packages/backend/convex/http.ts). Both values are printed by
 * `npx convex dev` in packages/backend:
 *
 *   NEXT_PUBLIC_CONVEX_URL       https://<deployment>.convex.cloud
 *   NEXT_PUBLIC_CONVEX_SITE_URL  https://<deployment>.convex.site
 *
 * Built on first request rather than at import: it throws when the site URL
 * is missing, and at import that would fail `next build` for the whole site.
 */
let auth: ReturnType<typeof convexBetterAuthNextJs> | undefined;

function authHandler() {
  auth ??= convexBetterAuthNextJs({
    convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL ?? "",
    convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
  });
  return auth.handler;
}

export const GET = (request: Request) => authHandler().GET(request);
export const POST = (request: Request) => authHandler().POST(request);
