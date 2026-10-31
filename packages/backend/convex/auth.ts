import { getProducts, isPlaceholderProduct } from "@castfy/plans";
import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { checkout, polar, portal, webhooks } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import type { Order } from "@polar-sh/sdk/models/components/order.js";
import { type BetterAuthOptions, betterAuth } from "better-auth";
import { deviceAuthorization } from "better-auth/plugins";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import authConfig from "./auth.config";
import authSchema from "./betterAuth/schema";

/**
 * The only client_id allowed to start a device sign-in. The desktop app sends
 * it with /device/code; anything else is refused, so the endpoint can't be
 * used to mint sessions for some other client.
 */
export const DESKTOP_CLIENT_ID = "castfy-desktop";

/**
 * Installed locally (convex/betterAuth/) rather than from the package: the
 * packaged component has no table for device codes, and desktop sign-in
 * needs one.
 */
export const authComponent = createClient<DataModel, typeof authSchema>(
  components.betterAuth,
  { local: { schema: authSchema } }
);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set on the Convex deployment. ` +
        `Set it with \`npx convex env set ${name} <value>\`.`
    );
  }
  return value;
}

/**
 * Google is the only way to sign in. Left out until its keys are set, so a
 * deployment without them still loads; signing in then fails with Better
 * Auth's "provider not found" until GOOGLE_CLIENT_ID/SECRET are added.
 *
 * The OAuth client's redirect URI is `${SITE_URL}/api/auth/callback/google`:
 * the website proxies /api/auth here, so Google only ever sees the site.
 */
function socialProviders() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if (!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)) {
    return {};
  }
  return {
    google: {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      // Always offer the account chooser, so someone signed in to several
      // Google accounts picks the one their Castfy account belongs to.
      prompt: "select_account" as const,
    },
  };
}

/** Polar's order, reduced to the fields the app keeps. */
function toPurchaseRow(order: Order) {
  return {
    polarOrderId: order.id,
    polarCustomerId: order.customerId,
    userId: order.customer.externalId ?? null,
    productId: order.productId,
    status: order.status,
    paidAt: order.createdAt.getTime(),
  };
}

/**
 * Billing plugins, only when Polar is configured. The paid tier is one
 * one-time product; the desktop app asks for it by its @castfy/plans slug
 * ("lifetime") and never carries a product ID.
 */
function polarPlugins(ctx: GenericCtx<DataModel>) {
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    return [];
  }

  // getProducts() picks the product set by POLAR_ENVIRONMENT, so that must be
  // set whenever Polar is: sandbox product IDs do not exist in production.
  requireEnv("POLAR_ENVIRONMENT");
  const products = Object.entries(getProducts())
    .filter(([, product]) => !isPlaceholderProduct(product.id))
    .map(([slug, product]) => ({ productId: product.id, slug }));

  /**
   * Webhooks arrive through the HTTP router, which hands createAuth an action
   * context. Mirrored into the purchases table so plan checks are a local
   * read instead of a call to Polar on every export.
   */
  const syncOrder = async (order: Order) => {
    if (!("runMutation" in ctx)) {
      throw new Error("Polar webhooks must be handled in an action context");
    }
    await ctx.runMutation(
      internal.billing.upsertPurchase,
      toPurchaseRow(order)
    );
  };

  return [
    polar({
      client: new Polar({
        accessToken,
        server:
          requireEnv("POLAR_ENVIRONMENT") === "production"
            ? "production"
            : "sandbox",
      }),
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products,
          // Absolute: Polar resolves a relative one against the request URL,
          // which behind the website's /api/auth proxy is the Convex site.
          successUrl: `${process.env.SITE_URL}/checkout/success?checkout_id={CHECKOUT_ID}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: requireEnv("POLAR_WEBHOOK_SECRET"),
          // A one-time order is paid, then possibly refunded. "updated"
          // covers any other status change (e.g. a partial refund).
          onOrderPaid: (payload) => syncOrder(payload.data),
          onOrderUpdated: (payload) => syncOrder(payload.data),
          onOrderRefunded: (payload) => syncOrder(payload.data),
        }),
      ],
    }),
  ];
}

/**
 * The Better Auth options, shared by the HTTP handler (createAuth) and the
 * local component (betterAuth/adapter.ts), which reads them to know the
 * tables. The component runs without the deployment's env vars, so nothing
 * here may require one at construction; each is required where it's used.
 */
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  const siteUrl = process.env.SITE_URL;
  return {
    // Unset only inside the component, which never serves a request.
    baseURL: siteUrl,
    // Better Auth reads BETTER_AUTH_SECRET itself and refuses to run in
    // production without it.
    database: authComponent.adapter(ctx),
    trustedOrigins: siteUrl ? [siteUrl] : [],
    socialProviders: socialProviders(),
    session: {
      // Better Auth only lists sessions for one signed in within the last day
      // ("fresh"). The desktop app stays signed in for weeks, so its Sessions
      // page would stop working a day after sign-in. Nothing else here relies
      // on freshness: there is no password or email to change.
      freshAge: 0,
    },
    plugins: [
      /**
       * Desktop sign-in (RFC 8628). The app asks for a code, opens
       * /device?user_code=… in the browser, and polls /device/token until the
       * user approves there. The token it gets is a session token, which the
       * bearer handling in the convex plugin accepts.
       */
      deviceAuthorization({
        verificationUri: `${siteUrl}/device`,
        validateClient: (clientId) => clientId === DESKTOP_CLIENT_ID,
      }),
      ...polarPlugins(ctx),
      convex({ authConfig }),
    ],
  } satisfies BetterAuthOptions;
};

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  // Every redirect and the /device link are built from it.
  requireEnv("SITE_URL");
  return betterAuth(createAuthOptions(ctx));
};

/** The signed-in user, or null. Safe to call signed out. */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => (await authComponent.safeGetAuthUser(ctx)) ?? null,
});
