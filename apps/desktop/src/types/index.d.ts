import type { React } from "react";
import type { IconType } from "react-icons/lib";

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

export interface AgentStep {
  action: string;
  description: string;
  error?: string;
  /** Dropped from the clean cut — a retry, a mistake, or marked by the agent. */
  excluded?: boolean;
  /** castfy0's step number, when the step came from its live progress file. */
  id?: number;
  ref?: string;
  status: "success" | "error";
  /** When the step happened, as an ISO timestamp. */
  t?: string;
  value?: string;
}

/** One stage of packaging the recording at castfy0_end. */
export interface PackagingStage {
  key: string;
  label: string;
}

export type AIProvider = "anthropic" | "openai" | "gemini";

// Shape of any SSE event payload the backend emits (status/step/completed/error).
export interface SseEventData {
  action?: string;
  description?: string;
  error?: string;
  message?: string;
  ref?: string;
  status?: "success" | "error";
  steps?: AgentStep[];
  value?: string;
  videos?: Record<string, string>;
  videoUrl?: string;
}

export interface SseHandlers {
  onCompleted: (data: SseEventData) => void;
  onError: (message: string) => void;
  onStatus: (message: string) => void;
  onStep: (step: AgentStep) => void;
  /** Packaging moved on to a new stage. */
  onStage?: (stage: PackagingStage) => void;
}

export type TSettingPages = "agents" | "profile" | "sessions" | "billing";
