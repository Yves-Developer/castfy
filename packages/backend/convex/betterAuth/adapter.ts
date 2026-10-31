import { createApi } from "@convex-dev/better-auth";
import { createAuthOptions } from "../auth";
import schema from "./schema";

/** The database functions Better Auth calls through authComponent.adapter(). */
export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuthOptions);
