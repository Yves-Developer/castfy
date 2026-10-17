/**
 * Auto-zoom: move in toward what the agent clicks, then back out.
 *
 * castfy0 records every click and hover with its position and its time in the
 * finished video (segments.json, `events`). This turns those into a camera:
 * at any moment, how far to zoom and where to. It is pure and shared, so the
 * studio preview and the exported video zoom exactly alike.
 */

export interface ZoomEvent {
  /** Time in the video, ms. */
  ms: number;
  type: "click" | "hover";
  /** CSS pixels in the recorded viewport. */
  x: number;
  y: number;
}

export interface ZoomTrack {
  events: ZoomEvent[];
  viewport: { width: number; height: number };
}

export interface Camera {
  /** Where the zoom is centred, as fractions of the frame (0..1). */
  originX: number;
  originY: number;
  scale: number;
}

const SCALE = { click: 1.6, hover: 1.35 } as const;
/** How early the move in starts before the event. */
const LEAD_MS = 450;
/** How long the result stays zoomed after the event. */
const HOLD_MS = 1400;
/** How long the move back out takes. */
const OUT_MS = 600;
/** Events closer than this stay zoomed and pan between each other. */
const MERGE_MS = 2200;

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
    const point = { ms: event.ms, x: event.x / width, y: event.y / height };
    const last = shots.at(-1);
    if (last && event.ms - last.points.at(-1)!.ms <= MERGE_MS) {
      last.points.push(point);
      last.endMs = event.ms + HOLD_MS;
      last.scale = Math.max(last.scale, SCALE[event.type]);
    } else {
      shots.push({
        startMs: Math.max(0, event.ms - LEAD_MS),
        endMs: event.ms + HOLD_MS,
        scale: SCALE[event.type],
        points: [point],
      });
    }
  }
  return shots;
}

/** Keeps the zoomed frame inside the video: no empty edges at the borders. */
function clampOrigin(origin: number, scale: number): number {
  if (scale <= 1) {
    return 0.5;
  }
  // With transform-origin o and scale s, the visible window starts at
  // o * (1 - 1/s); any origin in [0, 1] keeps it inside the frame.
  return Math.min(1, Math.max(0, origin));
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

  return {
    scale,
    originX: clampOrigin(x, scale),
    originY: clampOrigin(y, scale),
  };
}

/** CSS for the element that holds the video. */
export function cameraStyle(camera: Camera): {
  transform: string;
  transformOrigin: string;
} {
  return {
    transform: `scale(${camera.scale.toFixed(4)})`,
    transformOrigin: `${(camera.originX * 100).toFixed(2)}% ${(camera.originY * 100).toFixed(2)}%`,
  };
}
