import { useEffect, useState } from "react";

/**
 * The recording being made right now, for the studio's live view.
 *
 * castfy0 keeps the page as it currently looks in <session>/live.jpg while it
 * records (a hidden browser window is not something the user can watch). The
 * event stream that already drives the agent panel announces which session is
 * live; the player listens here and shows that frame until the run ends.
 */
const LIVE_EVENT = "castfy:live";

export interface LiveState {
  sessionId: string | null;
  /** The step the agent just took, shown under the frame. */
  step: string | null;
}

let current: LiveState = { sessionId: null, step: null };

export function setLive(patch: Partial<LiveState>): void {
  current = { ...current, ...patch };
  window.dispatchEvent(
    new CustomEvent<LiveState>(LIVE_EVENT, { detail: current })
  );
}

export function useLive(): LiveState {
  const [state, setState] = useState(current);
  useEffect(() => {
    const onLive = (event: Event) =>
      setState((event as CustomEvent<LiveState>).detail);
    window.addEventListener(LIVE_EVENT, onLive);
    return () => window.removeEventListener(LIVE_EVENT, onLive);
  }, []);
  return state;
}

/** Media URL for a session's live frame; `bust` defeats the image cache. */
export function liveFrameUrl(sessionId: string, bust: number): string {
  return `castfy://app/__media/${encodeURIComponent(sessionId)}/live.jpg?t=${bust}`;
}
