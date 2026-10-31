import type { GenericCtx } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth";
import type { DataModel } from "../_generated/dataModel";
import { createAuthOptions } from "../auth";

/**
 * A static instance for the Better Auth CLI, which reads it to generate
 * schema.ts. Regenerate after adding or removing a plugin that has tables:
 *
 *   cd packages/backend/convex/betterAuth && npx auth generate --output schema.ts
 */
export const auth = betterAuth(createAuthOptions({} as GenericCtx<DataModel>));
