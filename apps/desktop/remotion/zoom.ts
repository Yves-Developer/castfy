/**
 * Auto-zoom: move in toward what the agent clicks, then back out.
 *
 * castfy0 records every click and hover with its position and its time in the
 * finished video (segments.json, `events`), and the pointer's moves between
 * them (drawn by pointer.tsx). This turns the clicks and hovers into a camera:
 * at any moment, how far to zoom and where to. It is pure and shared, so the
 * studio preview and the exported video zoom exactly alike.
 */

export interface ZoomEvent {
  /** A move's length; with fromX and fromY, where it starts. */
  durationMs?: number;
  fromX?: number;
  fromY?: number;
  /** Time in the video, ms. */
  ms: number;
  type: "click" | "hover" | "move";
  /** Clicks and hovers: the target's size, CSS pixels (recorded since castfy0 0.3). */
  w?: number;
  h?: number;
  /** CSS pixels in the recorded viewport; for a move, where it ends. */
  x: number;
  y: number;
}

export interface ZoomTrack {
  events: ZoomEvent[];
  viewport: { width: number; height: number };
}

export interface Camera {
  /** What the zoom looks at, as fractions of the frame (0..1). */
  originX: number;
  originY: number;
  scale: number;
}

const SCALE = { click: 1.8, hover: 1.5 } as const;
/** How early the move in starts before the event. */
const LEAD_MS = 450;
/** How long the result stays zoomed after the event. */
const HOLD_MS = 1800;
/** How long the move back out takes. */
const OUT_MS = 600;
/** Events closer than this stay zoomed and pan between each other. */
const MERGE_MS = 2200;
/** The most of the frame a target may fill when zoomed in on. */
const FIT = 0.8;
/** Closer than this is not worth a zoom: the target is big already. */
const MIN_SCALE = 1.15;

/**
 * How far to zoom in on an event: its type's zoom, but never so far that the
 * target itself no longer fits. A full-width headline cut off at both sides
 * was the result before; a small button still gets the full zoom.
 */
function eventScale(event: ZoomEvent, width: number, height: number): number {
  const base = SCALE[event.type as keyof typeof SCALE];
  if (!(event.w && event.h)) {
    return base;
  }
  const fill = Math.max(event.w / width, event.h / height);
  return Math.min(base, FIT / fill);
}

const IDLE: Camera = { scale: 1, originX: 0.5, originY: 0.5 };

const ease = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c < 0.5 ? 4 * c * c * c : 1 - (-2 * c + 2) ** 3 / 2;
};

interface Shot {
  endMs: number;
  points: Array<{ ms: number; x: number; y: number }>;
  scale: number;
  startMs: number;
}

/** Groups events into continuous zoomed shots. */
export function planShots(track: ZoomTrack | null | undefined): Shot[] {
  if (!track?.events.length) {
    return [];
  }
  const { width, height } = track.viewport;
  const events = [...track.events].sort((a, b) => a.ms - b.ms);
  const shots: Shot[] = [];

  for (const event of events) {
    if (event.type === "move") {
      continue;
    }
    const scale = eventScale(event, width, height);
    if (scale < MIN_SCALE) {
      continue;
    }
    const point = { ms: event.ms, x: event.x / width, y: event.y / height };
    const last = shots.at(-1);
    if (last && event.ms - last.points.at(-1)!.ms <= MERGE_MS) {
      last.points.push(point);
      last.endMs = event.ms + HOLD_MS;
      // One zoom for the whole shot, close enough for its widest target.
      last.scale = Math.min(last.scale, scale);
    } else {
      shots.push({
        startMs: Math.max(0, event.ms - LEAD_MS),
        endMs: event.ms + HOLD_MS,
        scale,
        points: [point],
      });
    }
  }
  return shots;
}

/**
 * Where the visible window starts, as a fraction of the frame, for a camera
 * looking at `focus`: centred on it, but never past an edge of the video.
 *
 * Zooming about the focus point instead kept that point where it was on
 * screen, so a target near an edge stayed at the edge and half of what was
 * around it was cut off.
 */
function windowStart(focus: number, scale: number): number {
  const size = 1 / scale;
  return Math.min(1 - size, Math.max(0, focus - size / 2));
}

/** The camera at a moment of the video. */
export function cameraAt(ms: number, shots: Shot[]): Camera {
  const shot = shots.find((s) => ms >= s.startMs && ms <= s.endMs + OUT_MS);
  if (!shot) {
    return IDLE;
  }

  // How far in: ease in over the lead, hold, ease out after the end.
  const inProgress = ease((ms - shot.startMs) / LEAD_MS);
  const outProgress =
    ms > shot.endMs ? 1 - ease((ms - shot.endMs) / OUT_MS) : 1;
  const amount = Math.min(inProgress, outProgress);
  const scale = 1 + (shot.scale - 1) * amount;

  // Where: the latest point reached, easing between consecutive points.
  const { points } = shot;
  let x = points[0].x;
  let y = points[0].y;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const next = points[i];
    if (ms <= prev.ms) {
      break;
    }
    const t = ease(
      (ms - prev.ms) / Math.max(1, Math.min(LEAD_MS * 2, next.ms - prev.ms))
    );
    x = prev.x + (next.x - prev.x) * t;
    y = prev.y + (next.y - prev.y) * t;
  }

  return { scale, originX: x, originY: y };
}

/** CSS for the element that holds the video. */
export function cameraStyle(camera: Camera): {
  transform: string;
  transformOrigin: string;
} {
  const left = windowStart(camera.originX, camera.scale);
  const top = windowStart(camera.originY, camera.scale);
  // Scale from the top-left corner, then shift the window into place
  // (translate percentages are of the element, so of the frame).
  return {
    transform: `scale(${camera.scale.toFixed(4)}) translate(${(-left * 100).toFixed(3)}%, ${(-top * 100).toFixed(3)}%)`,
    transformOrigin: "0 0",
  };
}
