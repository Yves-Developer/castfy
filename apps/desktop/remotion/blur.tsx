/**
 * Blur boxes: parts of the recording the user hid in the studio, such as a
 * personal email or a customer's name. Each box covers a rectangle of the
 * recording for a stretch of time.
 *
 * Positions are fractions of the recorded frame (0..1) and times are ms in
 * the finished video, so the box stays on the same thing at any size: the
 * studio's small preview and the full-size export draw it alike. It sits
 * inside the zoomed element, so it zooms with the page.
 */

export interface BlurBox {
  /** When the box stops showing, ms in the finished video. */
  endMs: number;
  /** Height, as a fraction of the frame. */
  h: number;
  id: string;
  /** When the box starts showing, ms in the finished video. */
  startMs: number;
  /** Width, as a fraction of the frame. */
  w: number;
  /** Left edge, as a fraction of the frame. */
  x: number;
  /** Top edge, as a fraction of the frame. */
  y: number;
}

/**
 * How strong the blur is, in container units (1cqw is 1% of the frame's
 * width): strong enough that text under it cannot be read at any size.
 */
const BLUR = "0.8cqw";

export function isBlurShown(box: BlurBox, ms: number): boolean {
  return ms >= box.startMs && ms < box.endMs;
}

export function BlurBoxes({
  ms,
  boxes,
}: {
  ms: number;
  boxes?: BlurBox[] | null;
}) {
  const shown = (boxes ?? []).filter((box) => isBlurShown(box, ms));
  if (shown.length === 0) {
    return null;
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // The blur is measured against the frame, not the screen.
        containerType: "size",
        pointerEvents: "none",
      }}
    >
      {shown.map((box) => (
        <div
          key={box.id}
          style={{
            position: "absolute",
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
            backdropFilter: `blur(${BLUR})`,
            WebkitBackdropFilter: `blur(${BLUR})`,
            // A light veil too, so even a flat colour under it looks hidden.
            background: "rgba(210, 210, 210, 0.5)",
            borderRadius: "0.4cqw",
          }}
        />
      ))}
    </div>
  );
}
