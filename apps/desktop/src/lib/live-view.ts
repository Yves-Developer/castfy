import { useEffect, useState } from "react";
import { bridge, type RecordingFrame } from "@/lib/bridge";

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

/** Media URL for where the agent's pointer is (castfy0's live-pointer.json). */
export function livePointerUrl(sessionId: string, bust: number): string {
  return `castfy://app/__media/${encodeURIComponent(sessionId)}/live-pointer.json?t=${bust}`;
}

/** The recording browser's latest frame, as an image URL, with its page size. */
export interface LiveFrame {
  url: string;
  viewport: RecordingFrame["viewport"];
}

const FRAME_EVENT = "castfy:recording-frame";
let frame: LiveFrame | null = null;

// One subscription for the app: frames arrive whether or not a view is open,
// and each replaces (and frees) the last.
bridge?.onRecordingFrame?.((next) => {
  if (frame) {
    URL.revokeObjectURL(frame.url);
  }
  frame = next
    ? {
        url: URL.createObjectURL(new Blob([next.jpeg as BlobPart], { type: "image/jpeg" })),
        viewport: next.viewport,
      }
    : null;
  window.dispatchEvent(new CustomEvent(FRAME_EVENT));
});

/** The recording browser as it looks now; null when no run has one open. */
export function useRecordingFrame(): LiveFrame | null {
  const [state, setState] = useState(frame);
  useEffect(() => {
    const onFrame = () => setState(frame);
    window.addEventListener(FRAME_EVENT, onFrame);
    return () => window.removeEventListener(FRAME_EVENT, onFrame);
  }, []);
  return state;
}
