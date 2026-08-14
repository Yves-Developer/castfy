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
  ref?: string;
  status: "success" | "error";
  value?: string;
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
}
