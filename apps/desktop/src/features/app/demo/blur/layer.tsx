"use client";
import { cn } from "@castfy/ui/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useBackgroundStore } from "@/lib/store";
import { type BlurBox, isBlurShown } from "../../../../../remotion/blur";
import { playheadMs, previewVideo, useBlurTool, videoDurationMs } from "./tool";

/** Smaller than this, as a fraction of the frame, a drag is a click, not a box. */
const MIN_SIZE = 0.01;
/** A box drawn before the video knows its length lasts this long. */
const FALLBACK_MS = 5000;

interface Rect {
  height: number;
  left: number;
  top: number;
  width: number;
}

type Drag =
  | { kind: "draw"; x0: number; y0: number; x1: number; y1: number }
  | {
      kind: "move" | "resize";
      id: string;
      corner?: Corner;
      px: number;
      py: number;
      start: BlurBox;
    };

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Over the studio preview, while the Blur panel is open: draw a box on the
 * video, then move it or resize it by its corners. The blur itself is drawn
 * by the composition (remotion/blur.tsx); this only edits where it goes.
 *
 * Follows the video's place on screen every frame, zoom included, so a box
 * is drawn over exactly what it hides.
 */
export function BlurLayer() {
  const { panelOpen, drawing, selectedId, onResult, set } = useBlurTool();
  const blurs = useBackgroundStore((s) => s.blurs);
  const addBlur = useBackgroundStore((s) => s.addBlur);
  const updateBlur = useBackgroundStore((s) => s.updateBlur);
  const removeBlur = useBackgroundStore((s) => s.removeBlur);
  const rootRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ms, setMs] = useState(0);
  const [drag, setDrag] = useState<Drag | null>(null);
  const active = panelOpen && onResult;

  // Where the video is inside this layer, and its time, every frame.
  useEffect(() => {
    if (!active) {
      return;
    }
    let raf = 0;
    const tick = () => {
      const root = rootRef.current;
      const video = previewVideo();
      if (root && video) {
        const r = root.getBoundingClientRect();
        const v = video.getBoundingClientRect();
        setRect((prev) => {
          const next = {
            left: v.left - r.left,
            top: v.top - r.top,
            width: v.width,
            height: v.height,
          };
          return prev &&
            prev.left === next.left &&
            prev.top === next.top &&
            prev.width === next.width &&
            prev.height === next.height
            ? prev
            : next;
        });
        setMs(Math.round(video.currentTime * 1000));
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Escape stops drawing; Delete removes the selected box.
  useEffect(() => {
    if (!active) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) {
        return;
      }
      if (e.key === "Escape") {
        set({ drawing: false, selectedId: null });
      } else if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeBlur(selectedId);
        set({ selectedId: null });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, selectedId, removeBlur, set]);

  if (!(active && rect)) {
    return (
      <div className="pointer-events-none absolute inset-0" ref={rootRef} />
    );
  }

  /** A pointer position as fractions of the video. */
  const at = (e: React.PointerEvent) => {
    const root = rootRef.current?.getBoundingClientRect();
    if (!root) {
      return { x: 0, y: 0 };
    }
    return {
      x: clamp((e.clientX - root.left - rect.left) / rect.width),
      y: clamp((e.clientY - root.top - rect.top) / rect.height),
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag) {
      return;
    }
    const p = at(e);
    if (drag.kind === "draw") {
      setDrag({ ...drag, x1: p.x, y1: p.y });
      return;
    }
    const dx = p.x - drag.px;
    const dy = p.y - drag.py;
    const b = drag.start;
    if (drag.kind === "move") {
      updateBlur(drag.id, {
        x: clamp(Math.min(b.x + dx, 1 - b.w)),
        y: clamp(Math.min(b.y + dy, 1 - b.h)),
      });
      return;
    }
    // Resize: the dragged corner moves, the opposite one stays.
    let left = b.x;
    let top = b.y;
    let right = b.x + b.w;
    let bottom = b.y + b.h;
    if (drag.corner?.includes("w")) {
      left = clamp(b.x + dx);
    } else {
      right = clamp(b.x + b.w + dx);
    }
    if (drag.corner?.includes("n")) {
      top = clamp(b.y + dy);
    } else {
      bottom = clamp(b.y + b.h + dy);
    }
    updateBlur(drag.id, {
      x: Math.min(left, right),
      y: Math.min(top, bottom),
      w: Math.max(MIN_SIZE, Math.abs(right - left)),
      h: Math.max(MIN_SIZE, Math.abs(bottom - top)),
    });
  };

  const onPointerUp = () => {
    if (drag?.kind === "draw") {
      const x = Math.min(drag.x0, drag.x1);
      const y = Math.min(drag.y0, drag.y1);
      const w = Math.abs(drag.x1 - drag.x0);
      const h = Math.abs(drag.y1 - drag.y0);
      if (w >= MIN_SIZE && h >= MIN_SIZE) {
        // From here to the end: a personal email on screen usually stays.
        const startMs = playheadMs();
        const duration = videoDurationMs();
        const endMs = duration > startMs ? duration : startMs + FALLBACK_MS;
        const id = addBlur({ x, y, w, h, startMs, endMs });
        set({ drawing: false, selectedId: id });
      }
    }
    setDrag(null);
  };

  const start = (e: React.PointerEvent, next: Drag) => {
    e.preventDefault();
    e.stopPropagation();
    rootRef.current?.setPointerCapture(e.pointerId);
    setDrag(next);
  };

  // Outlined: the boxes on screen now, and the selected one wherever it is.
  const outlined = blurs.filter(
    (b) => b.id === selectedId || isBlurShown(b, ms)
  );
  const preview =
    drag?.kind === "draw"
      ? {
          x: Math.min(drag.x0, drag.x1),
          y: Math.min(drag.y0, drag.y1),
          w: Math.abs(drag.x1 - drag.x0),
          h: Math.abs(drag.y1 - drag.y0),
        }
      : null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      onPointerCancel={onPointerUp}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={rootRef}
    >
      <div
        className="absolute"
        data-castfy="blur-layer"
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        }}
      >
        {drawing ? (
          <div
            className="pointer-events-auto absolute inset-0 cursor-crosshair bg-black/10"
            onPointerDown={(e) => {
              const p = at(e);
              start(e, { kind: "draw", x0: p.x, y0: p.y, x1: p.x, y1: p.y });
            }}
          />
        ) : null}

        {outlined.map((box) => (
          <BoxOutline
            box={box}
            drawing={drawing}
            key={box.id}
            live={isBlurShown(box, ms)}
            onCorner={(e, corner) => {
              const p = at(e);
              start(e, {
                kind: "resize",
                id: box.id,
                corner,
                px: p.x,
                py: p.y,
                start: box,
              });
            }}
            onMove={(e) => {
              set({ selectedId: box.id });
              const p = at(e);
              start(e, {
                kind: "move",
                id: box.id,
                px: p.x,
                py: p.y,
                start: box,
              });
            }}
            selected={box.id === selectedId}
          />
        ))}

        {preview ? (
          <div
            className="pointer-events-none absolute rounded-sm border-2 border-[#09f] bg-[#09f]/15"
            style={{
              left: `${preview.x * 100}%`,
              top: `${preview.y * 100}%`,
              width: `${preview.w * 100}%`,
              height: `${preview.h * 100}%`,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

const CORNERS = ["nw", "ne", "sw", "se"] as const;
type Corner = (typeof CORNERS)[number];

/** A box's outline over the video, with corner handles when selected. */
function BoxOutline({
  box,
  selected,
  live,
  drawing,
  onMove,
  onCorner,
}: {
  box: BlurBox;
  selected: boolean;
  /** Showing at the playhead; a selected box outside its time is faded. */
  live: boolean;
  drawing: boolean;
  onMove: (e: React.PointerEvent) => void;
  onCorner: (e: React.PointerEvent, corner: Corner) => void;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-sm border-2",
        selected ? "border-[#09f]" : "border-white/80 border-dashed",
        drawing ? "pointer-events-none" : "pointer-events-auto cursor-move",
        !live && "opacity-50"
      )}
      data-castfy="blur-box"
      onPointerDown={onMove}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.w * 100}%`,
        height: `${box.h * 100}%`,
        boxShadow: "0 0 0 1px rgba(0,0,0,.35)",
      }}
    >
      {selected
        ? CORNERS.map((corner) => (
            <div
              className="absolute size-2.5 rounded-full border-2 border-white bg-[#09f]"
              data-castfy={`blur-corner-${corner}`}
              key={corner}
              onPointerDown={(e) => onCorner(e, corner)}
              style={{
                left: corner.includes("w") ? -6 : undefined,
                right: corner.includes("e") ? -6 : undefined,
                top: corner.includes("n") ? -6 : undefined,
                bottom: corner.includes("s") ? -6 : undefined,
                cursor:
                  corner === "nw" || corner === "se"
                    ? "nwse-resize"
                    : "nesw-resize",
              }}
            />
          ))
        : null}
    </div>
  );
}
