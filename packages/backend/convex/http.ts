import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

/**
 * Better Auth under /api/auth/*: sign-in with Google, the
 * desktop device flow (/device/code, /device/token), the Convex JWT exchange
 * (/convex/token) and, when Dodo Payments is configured, its checkout,
 * customer portal and webhooks under /dodopayments.
 */
authComponent.registerRoutes(http, createAuth);

export default http;
