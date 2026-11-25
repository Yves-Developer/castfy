import { create } from "zustand";
import { bridge } from "@/lib/bridge";
import { useStageView } from "./stage-view";
import type { AgentEvent } from "./types";

/**
 * The thread the Agent view shows: the run going on now, as main.js streams
 * it (demo:agent), or a finished recording's, read from its folder.
 */
interface AgentLogState {
  events: AgentEvent[];
  /** A run is streaming into it. */
  live: boolean;
  /** The recording it was read from; null for a live run. */
  sessionId: string | null;
  /** A tool call picked from the steps, to scroll to and mark. */
  highlightId: string | null;
  /** Shows a recording's saved thread, unless a run is streaming. */
  load(sessionId: string | null): Promise<void>;
  /** Opens the Agent view on the call behind a step. */
  highlight(id: string | null): void;
}

/** Replaces an event the thread already has (a call that got its result), or adds it. */
function upsert(events: AgentEvent[], incoming: AgentEvent[]): AgentEvent[] {
  const next = [...events];
  const index = new Map(next.map((e, i) => [e.id, i]));
  for (const event of incoming) {
    const at = index.get(event.id);
    if (at === undefined) {
      index.set(event.id, next.length);
      next.push(event);
    } else {
      next[at] = event;
    }
  }
  return next;
}

export const useAgentLog = create<AgentLogState>()((set, get) => ({
  events: [],
  live: false,
  sessionId: null,
  highlightId: null,
  async load(sessionId) {
    if (get().live) {
      return;
    }
    if (!sessionId) {
      set({ events: [], sessionId: null, highlightId: null });
      return;
    }
    if (get().sessionId === sessionId && get().events.length > 0) {
      return;
    }
    const events =
      (await bridge?.agentLog?.(sessionId).catch(() => null)) ?? [];
    // A run may have started while the file was read.
    if (!get().live) {
      set({ events, sessionId, highlightId: null });
    }
  },
  highlight(id) {
    set({ highlightId: id });
    useStageView.getState().set("agent");
  },
}));

// One subscription for the app: a run's events arrive whether or not the view is open.
bridge?.onAgent?.(({ reset, events }) => {
  useAgentLog.setState((state) =>
    reset
      ? { events, live: true, sessionId: null, highlightId: null }
      : { events: upsert(state.events, events) }
  );
});
bridge?.onDone?.(({ sessionId }) => {
  useAgentLog.setState({ live: false, sessionId: sessionId ?? null });
});

/** "castfy0_click" for a step whose action is "click". */
const toolFor = (action: string) => `castfy0_${action.toLowerCase()}`;

/**
 * The tool call that made a castfy0 step: the latest call of that action
 * that started before the step was logged. Both come from the same run, a
 * step a moment after its call.
 */
export function callForStep(
  events: AgentEvent[],
  step: { action: string; t?: string; timestamp?: string }
): string | null {
  const name = toolFor(step.action);
  // Live steps carry `t`; a finished recording's steps.json says `timestamp`.
  const when = step.t ?? step.timestamp;
  const at = when ? Date.parse(when) : Number.NaN;
  let best: AgentEvent | null = null;
  for (const event of events) {
    if (event.kind !== "tool" || event.name !== name) {
      continue;
    }
    if (Number.isFinite(at) && event.t > at + 1000) {
      break;
    }
    best = event;
  }
  return best?.id ?? null;
}
