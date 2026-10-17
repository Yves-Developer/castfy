/**
 * The cursor, drawn over the recording.
 *
 * castfy0 used to draw its cursor inside the page, where it moved only as
 * fast as the page let it: on a busy site it jumped in two or three steps.
 * Now it records the pointer's path instead (segments.json: `move` events with
 * where from, where to and how long, and the clicks), and the cursor is drawn
 * here, smoothly at every frame whatever the site was doing. It sits inside
 * the zoomed element, so it zooms with the page.
 *
 * Recordings from before this have the cursor in the video and no moves, and
 * get nothing drawn over them.
 */
import type { ZoomEvent, ZoomTrack } from "./zoom";

/** The arrow's size in recorded CSS pixels, as castfy0 drew it. */
const CURSOR_PX = 32;
/** The arrow's tip sits this far into the image. */
const TIP_PX = 2;
const RIPPLE_PX = 60;
const RIPPLE_MS = 400;
const PRESS_MS = 160;

const easeOutCubic = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;

/** Where the pointer is at a moment, in recorded CSS pixels; null before it appears. */
export function pointerAt(
  ms: number,
  events: ZoomEvent[]
): { x: number; y: number } | null {
  let at: { x: number; y: number } | null = null;
  for (const e of events) {
    if (e.ms > ms) {
      break;
    }
    if (e.type === "move" && e.durationMs && ms < e.ms + e.durationMs) {
      const fromX = e.fromX ?? e.x;
      const fromY = e.fromY ?? e.y;
      const p = easeOutCubic((ms - e.ms) / e.durationMs);
      return { x: fromX + (e.x - fromX) * p, y: fromY + (e.y - fromY) * p };
    }
    at = { x: e.x, y: e.y };
  }
  return at;
}

export function hasPointerPath(track: ZoomTrack | null | undefined): boolean {
  return Boolean(track?.events.some((e) => e.type === "move"));
}

/** The cursor and click ripples at a moment of the video. */
export function Pointer({
  ms,
  track,
}: {
  ms: number;
  track: ZoomTrack | null | undefined;
}) {
  if (!(track && hasPointerPath(track))) {
    return null;
  }
  const { width, height } = track.viewport;
  const events = [...track.events].sort((a, b) => a.ms - b.ms);
  const at = pointerAt(ms, events);
  if (!at) {
    return null;
  }

  const pct = (px: number, of: number) => `${(px / of) * 100}%`;
  const clicks = events.filter(
    (e) => e.type === "click" && ms >= e.ms && ms < e.ms + RIPPLE_MS
  );
  const pressed = events.some(
    (e) => e.type === "click" && Math.abs(ms - e.ms) < PRESS_MS / 2
  );

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {clicks.map((click) => {
        const t = (ms - click.ms) / RIPPLE_MS;
        return (
          <div
            key={click.ms}
            style={{
              position: "absolute",
              left: pct(click.x, width),
              top: pct(click.y, height),
              width: pct(RIPPLE_PX, width),
              aspectRatio: "1",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(66,133,244,.6) 0%, rgba(66,133,244,0) 70%)",
              transform: `translate(-50%, -50%) scale(${0.2 + 0.8 * easeOutCubic(t)})`,
              opacity: 1 - t,
            }}
          />
        );
      })}
      <svg
        fill="none"
        style={{
          position: "absolute",
          left: pct(at.x - TIP_PX, width),
          top: pct(at.y - TIP_PX, height),
          width: pct(CURSOR_PX, width),
          height: "auto",
          overflow: "visible",
          transform: pressed ? "scale(0.85)" : undefined,
          transformOrigin: `${(TIP_PX / CURSOR_PX) * 100}% ${(TIP_PX / CURSOR_PX) * 100}%`,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))",
        }}
        viewBox="4 2 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Cursor</title>
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
          fill="#000"
          stroke="#fff"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
