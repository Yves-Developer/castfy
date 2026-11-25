import { useCallback, useEffect, useState } from "react";
import { bridge } from "@/lib/bridge";

export interface AgentModel {
  /** What is passed to the agent's --model; null leaves the agent's own setting. */
  id: string | null;
  label: string;
  hint: string;
}

/**
 * The models each agent can be asked for (picked in the agent menu,
 * sidebar/agent/models.tsx). Claude Code takes these aliases and
 * resolves them to its current model of that family.
 */
export const AGENT_MODELS: Record<string, AgentModel[]> = {
  "claude-code": [
    { id: null, label: "Default", hint: "Whatever your Claude Code uses" },
    {
      id: "opus",
      label: "Opus",
      hint: "Most careful, uses your limits fastest",
    },
    { id: "sonnet", label: "Sonnet", hint: "Good balance for most demos" },
    {
      id: "haiku",
      label: "Haiku",
      hint: "Fastest and lightest, may miss steps",
    },
  ],
  // The rest come from `opencode models`: whatever providers the user connected.
  opencode: [{ id: null, label: "Default", hint: "Whatever your OpenCode uses" }],
};

/** OpenCode's model list, asked once and shared by every menu. */
let openCodeList: Promise<AgentModel[]> | null = null;

/** The models to offer for an agent: the fixed ones, then any it lists itself. */
export function useAgentModels(agentId: string): AgentModel[] | undefined {
  const base = AGENT_MODELS[agentId];
  const [extra, setExtra] = useState<AgentModel[]>([]);
  useEffect(() => {
    if (agentId !== "opencode") {
      setExtra([]);
      return;
    }
    openCodeList ??= (bridge?.agentModels?.("opencode") ?? Promise.resolve([]))
      .then((ids) =>
        ids.map((id) => {
          const [provider, ...rest] = id.split("/");
          return { id, label: rest.join("/"), hint: provider ?? "" };
        })
      )
      .catch(() => []);
    let live = true;
    openCodeList.then((list) => {
      if (live) {
        setExtra(list);
      }
    });
    return () => {
      live = false;
    };
  }, [agentId]);
  return base ? [...base, ...extra] : undefined;
}

/**
 * The model chosen for an agent, kept in the app's settings (agentModels) so
 * main.js passes it to the agent's --model on every run.
 */
export function useAgentModel(
  agentId: string
): [string | null, (id: string | null) => void] {
  const [models, setModels] = useState<Record<string, string | null>>({});

  useEffect(() => {
    bridge
      ?.settings()
      .then((s) => setModels(s.agentModels ?? {}))
      .catch(() => {
        // Defaults: the agent's own model.
      });
  }, []);

  const set = useCallback(
    (id: string | null) => {
      setModels((prev) => {
        const next = { ...prev, [agentId]: id };
        bridge?.setSettings({ agentModels: next }).catch(() => {
          // Only the preference is lost; the run still works.
        });
        return next;
      });
    },
    [agentId]
  );

  return [models[agentId] ?? null, set];
}
