import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();

/**
 * Better Auth keeps its users, sessions, accounts and device codes in its own
 * component tables, so the app schema only holds what Castfy adds on top:
 * subscriptions and usage.
 */
app.use(betterAuth);

export default app;
