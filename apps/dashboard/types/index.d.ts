import type { FunctionReturnType } from "convex/server";
import type { React } from "react";
import type { IconType } from "react-icons/lib";
import type { api } from "@/convex/_generated/api";
export type UserWithSubscription = FunctionReturnType<
  typeof api.polar.user.getUser_withSubscription
>;
export type TsidebarPages =
  | "ai"
  | "background"
  | "design"
  | "captions"
  | "settings";

export interface TsidebarPage {
  component: React.ComponentType;
  icon: IconType;
  label: string;
  slug: TsidebarPages;
}

export interface Tdemo {
  action: string;
  img?: string;
  name: string;
  slug: string;
  updatedAt: string;
}
