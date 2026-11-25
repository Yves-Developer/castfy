/**
 * One thing the agent did, as the studio shows it in the Agent view.
 *
 * main.js turns each agent's own output (Claude Code's stream-json, OpenCode's
 * JSON events) into these, so the thread does not care which agent ran.
 */
export type AgentEvent =
  | { kind: "prompt"; id: string; t: number; text: string; url?: string }
  | { kind: "text"; id: string; t: number; text: string }
  | {
      kind: "tool";
      id: string;
      t: number;
      /** The tool's own name, without the agent's MCP prefix: "castfy0_click", "Read". */
      name: string;
      input: Record<string, unknown>;
      status: "running" | "done" | "error";
      output?: string;
      /** When the result arrived. */
      endedAt?: number;
    }
  | { kind: "error"; id: string; t: number; text: string }
  | {
      kind: "done";
      id: string;
      t: number;
      isError: boolean;
      turns?: number | null;
      durationMs?: number | null;
      tokens?: number | null;
      /** The agent's own price for the run, at API list prices. */
      costUsd?: number | null;
      model?: string | null;
      /** A Claude subscription's 5-hour limit, from the agent's rate-limit reports. */
      limit?: {
        /** Share of the limit this run used, 0–1 (the last report minus the first). */
        used: number;
        /** Where the limit stands now, 0–1. */
        now: number;
        /** When it resets, epoch seconds. */
        resetsAt: number;
      } | null;
    };
