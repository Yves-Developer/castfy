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
 * It moves as a hand does: a gentle start and stop on a slight arc (drags,
 * which the page follows, stay straight), with a faint trail when it moves
 * fast. It takes the page's shape where it lands: the system's own hand, text
 * cursor or crosshair (system-cursors.js) on the computer making the demo,
 * else Castfy's drawn ones. The arrow is always Castfy's.
 *
 * Recordings from before this have the cursor in the video and no moves, and
 * get nothing drawn over them.
 */
import type { SystemCursor, ZoomEvent, ZoomTrack } from "./zoom";

/** The arrow's size in recorded CSS pixels; castfy0 drew it at 32. */
const CURSOR_PX = 36;
/** System cursors are drawn this much larger than their own size, like the arrow. */
const SYSTEM_SCALE = CURSOR_PX / 32;
/** The arrow's tip sits this far into its image, at CURSOR_PX. */
const TIP_PX = 2.25;
const RIPPLE_PX = 60;
const RIPPLE_MS = 400;
const PRESS_MS = 160;
/** How far a move bows from a straight line, as a share of its length. */
const ARC = 0.06;
/** Moves shorter than this go straight. */
const ARC_MIN_PX = 80;
/** A move's new shape shows once it is this far along, as it arrives. */
const SHAPE_AT = 0.85;
/** The trail: how far back each ghost is, in ms, and how strong. */
const TRAIL = [
  { ms: 14, opacity: 0.22 },
  { ms: 28, opacity: 0.1 },
] as const;
/** Faster than this (recorded px per ms) leaves a trail. */
const TRAIL_SPEED = 1.1;

const easeOutCubic = (t: number) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
const easeInOutCubic = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};

/** Where a move is at progress p: eased, and bowed unless it is a drag. */
function alongMove(e: ZoomEvent, p: number): { x: number; y: number } {
  const fromX = e.fromX ?? e.x;
  const fromY = e.fromY ?? e.y;
  const eased = easeInOutCubic(p);
  const dx = e.x - fromX;
  const dy = e.y - fromY;
  const x = fromX + dx * eased;
  const y = fromY + dy * eased;
  const length = Math.hypot(dx, dy);
  if (e.drag || length < ARC_MIN_PX) {
    return { x, y };
  }
  // Bow to one side, upward for a move to the right, as a wrist swings.
  const side = dx >= 0 ? -1 : 1;
  const bow = side * ARC * length * Math.sin(Math.PI * eased);
  return { x: x + (-dy / length) * bow, y: y + (dx / length) * bow };
}

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
      return alongMove(e, (ms - e.ms) / e.durationMs);
    }
    at = { x: e.x, y: e.y };
  }
  return at;
}

export type CursorShape = "arrow" | "hand" | "text" | "crosshair";

/** The page's CSS cursor as one of the shapes drawn here. */
function shapeOf(css: string | undefined): CursorShape {
  switch (css) {
    case "pointer":
    case "grab":
    case "grabbing":
      return "hand";
    case "text":
      return "text";
    case "crosshair":
      return "crosshair";
    default:
      return "arrow";
  }
}

/** The cursor's shape at a moment: a move's shape shows as it arrives. */
export function shapeAt(ms: number, events: ZoomEvent[]): CursorShape {
  let shape: CursorShape = "arrow";
  for (const e of events) {
    if (e.ms > ms) {
      break;
    }
    if (e.type !== "move") {
      continue;
    }
    const arriving = !e.durationMs || ms >= e.ms + e.durationMs * SHAPE_AT;
    if (arriving) {
      shape = shapeOf(e.cursor);
    }
  }
  return shape;
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
  const shape = shapeAt(ms, events);

  const pct = (px: number, of: number) => `${(px / of) * 100}%`;
  const clicks = events.filter(
    (e) => e.type === "click" && ms >= e.ms && ms < e.ms + RIPPLE_MS
  );
  const pressed = events.some(
    (e) => e.type === "click" && Math.abs(ms - e.ms) < PRESS_MS / 2
  );

  // The trail, when moving fast: the cursor a moment ago, faint.
  const ghosts = TRAIL.flatMap(({ ms: back, opacity }) => {
    const then = pointerAt(ms - back, events);
    if (!then) {
      return [];
    }
    const speed = Math.hypot(at.x - then.x, at.y - then.y) / back;
    return speed > TRAIL_SPEED ? [{ ...then, opacity, key: back }] : [];
  });

  const draw = (
    x: number,
    y: number,
    opacity: number,
    key: string | number
  ) => (
    <CursorImage
      cursor={shape === "arrow" ? undefined : track.cursors?.[shape]}
      height={height}
      key={key}
      opacity={opacity}
      pressed={pressed && opacity === 1}
      shape={shape}
      width={width}
      x={x}
      y={y}
    />
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
      {ghosts.map((g) => draw(g.x, g.y, g.opacity, g.key))}
      {draw(at.x, at.y, 1, "cursor")}
    </div>
  );
}

/** Castfy's own shapes: where the hot spot is in each, and how big it is drawn. */
const DRAWN: Record<
  CursorShape,
  { hotX: number; hotY: number; size: number; viewBox: string }
> = {
  arrow: { viewBox: "4 2 24 24", hotX: TIP_PX, hotY: TIP_PX, size: CURSOR_PX },
  hand: {
    viewBox: "0 0 24 24",
    hotX: 9.5 * 1.5,
    hotY: 1.4 * 1.5,
    size: CURSOR_PX,
  },
  text: {
    viewBox: "0 0 24 24",
    hotX: 12 * 1.5,
    hotY: 12 * 1.5,
    size: CURSOR_PX,
  },
  crosshair: {
    viewBox: "0 0 24 24",
    hotX: 12 * 1.5,
    hotY: 12 * 1.5,
    size: CURSOR_PX,
  },
};

function CursorImage({
  cursor,
  shape,
  x,
  y,
  width,
  height,
  opacity,
  pressed,
}: {
  cursor: SystemCursor | undefined;
  height: number;
  opacity: number;
  pressed: boolean;
  shape: CursorShape;
  width: number;
  x: number;
  y: number;
}) {
  const pct = (px: number, of: number) => `${(px / of) * 100}%`;
  const shadow = "drop-shadow(0 1px 2px rgba(0,0,0,.35))";

  if (cursor) {
    const w = cursor.width * SYSTEM_SCALE;
    const hotX = cursor.hotX * SYSTEM_SCALE;
    const hotY = cursor.hotY * SYSTEM_SCALE;
    return (
      // biome-ignore lint/performance/noImgElement: drawn in Remotion and the Studio, not a Next.js page
      <img
        alt=""
        height={cursor.height}
        src={cursor.src}
        style={{
          position: "absolute",
          left: pct(x - hotX, width),
          top: pct(y - hotY, height),
          width: pct(w, width),
          height: "auto",
          opacity,
          transform: pressed ? "scale(0.85)" : undefined,
          transformOrigin: `${(hotX / w) * 100}% ${(hotY / (cursor.height * SYSTEM_SCALE)) * 100}%`,
        }}
        width={cursor.width}
      />
    );
  }

  const drawn = DRAWN[shape];
  return (
    <svg
      fill="none"
      style={{
        position: "absolute",
        left: pct(x - drawn.hotX, width),
        top: pct(y - drawn.hotY, height),
        width: pct(drawn.size, width),
        height: "auto",
        overflow: "visible",
        opacity,
        transform: pressed ? "scale(0.85)" : undefined,
        transformOrigin: `${(drawn.hotX / drawn.size) * 100}% ${(drawn.hotY / drawn.size) * 100}%`,
        filter: shadow,
      }}
      viewBox={drawn.viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Cursor</title>
      <DrawnShape shape={shape} />
    </svg>
  );
}

const HAND =
  "M8 2.9A1.5 1.5 0 0 1 11 2.9V9.6A1.5 1.5 0 0 1 14 9.6V10.4A1.5 1.5 0 0 1 17 10.4V11.2A1.4 1.4 0 0 1 19.8 11.2V16.5C19.8 19.8 17.6 22 14.6 22H12.5C10.9 22 9.5 21.3 8.5 20.1L4.6 15.6A1.6 1.6 0 0 1 7 13.5L8 14.6Z";
const IBEAM =
  "M9.2 4.6c1.4 0 2.3.3 2.8 1 .5-.7 1.4-1 2.8-1M12 5.6v12.8M9.2 19.4c1.4 0 2.3-.3 2.8-1 .5.7 1.4 1 2.8 1";
const CROSS = "M12 4v6.2M12 13.8V20M4 12h6.2M13.8 12H20";

/** Castfy's drawn shapes, in the macOS style, for when the system's are not available. */
function DrawnShape({ shape }: { shape: CursorShape }) {
  switch (shape) {
    case "hand":
      return (
        <>
          <path
            d={HAND}
            fill="#fff"
            stroke="#fff"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          <path
            d={HAND}
            fill="#fff"
            stroke="#000"
            strokeLinejoin="round"
            strokeWidth="1.15"
          />
          <path
            d="M11 9.6v3.8M14 10.4v3.2M17 11.2v2.8"
            stroke="#000"
            strokeLinecap="round"
            strokeWidth="1"
          />
        </>
      );
    case "text":
      return (
        <>
          <path
            d={IBEAM}
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="3.4"
          />
          <path
            d={IBEAM}
            stroke="#000"
            strokeLinecap="round"
            strokeWidth="1.3"
          />
        </>
      );
    case "crosshair":
      return (
        <>
          <path
            d={CROSS}
            stroke="#fff"
            strokeLinecap="square"
            strokeWidth="3.2"
          />
          <path
            d={CROSS}
            stroke="#000"
            strokeLinecap="square"
            strokeWidth="1.3"
          />
        </>
      );
    default:
      return (
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
          fill="#000"
          stroke="#fff"
          strokeWidth="1.5"
        />
      );
  }
}
