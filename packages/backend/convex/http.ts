import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

/**
 * Better Auth under /api/auth/*: sign-in (email code, Google, GitHub), the
 * desktop device flow (/device/code, /device/token), the Convex JWT exchange
 * (/convex/token) and, when Polar is configured, checkout, portal and
 * /polar/webhooks.
 */
authComponent.registerRoutes(http, createAuth);

export default http;
