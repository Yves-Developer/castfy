import { useEffect, useRef, useState } from "react";
import { bridge, type RecordingInput } from "@/lib/bridge";
import {
  liveFrameUrl,
  livePointerUrl,
  useLive,
  useRecordingFrame,
} from "@/lib/live-view";

/** How often castfy0's live files are re-read. castfy0 writes them about as often. */
const REFRESH_MS = 200;

/** castfy0's live pointer: the latest move, click or hover. */
interface LivePointer {
  durationMs?: number;
  t: number;
  type: "click" | "hover" | "move";
  viewport: { width: number; height: number };
  x: number;
  y: number;
}

/** Browser key names to the ones Electron's sendInputEvent takes. */
const KEY_CODES: Record<string, string> = {
  " ": "Space",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
};
const BUTTONS = ["left", "middle", "right"] as const;

function modifiers(e: React.MouseEvent | React.KeyboardEvent): string[] {
  const out: string[] = [];
  if (e.shiftKey) {
    out.push("shift");
  }
  if (e.ctrlKey) {
    out.push("control");
  }
  if (e.altKey) {
    out.push("alt");
  }
  if (e.metaKey) {
    out.push("meta");
  }
  return out;
}

/**
 * castfy0's live frame (live.jpg), for runs where castfy0 has its own browser.
 *
 * Each frame is loaded off-screen and swapped in only once it has decoded, so
 * the view never flashes blank between frames or when the file is briefly
 * missing (it is replaced by a rename, and removed when recording stops).
 */
function usePolledFrame(sessionId: string | null, enabled: boolean) {
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!(sessionId && enabled)) {
      return;
    }
    let cancelled = false;
    let loading = false;
    const tick = () => {
      if (loading) {
        return;
      }
      loading = true;
      const url = liveFrameUrl(sessionId, Date.now());
      const img = new Image();
      img.onload = () => {
        loading = false;
        if (!cancelled) {
          setShown(url);
        }
      };
      img.onerror = () => {
        loading = false;
      };
      img.src = url;
    };
    tick();
    const timer = setInterval(tick, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sessionId, enabled]);
  return shown;
}

/** Where the agent last moved its pointer (castfy0's live-pointer.json). */
function useLivePointer(sessionId: string | null) {
  const [pointer, setPointer] = useState<LivePointer | null>(null);
  useEffect(() => {
    if (!sessionId) {
      setPointer(null);
      return;
    }
    let cancelled = false;
    const tick = () => {
      fetch(livePointerUrl(sessionId, Date.now()), { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((next: LivePointer | null) => {
          if (!cancelled && next) {
            setPointer((prev) => (prev?.t === next.t ? prev : next));
          }
        })
        .catch(() => {
          // No pointer yet, or mid-rename: keep the last one.
        });
    };
    tick();
    const timer = setInterval(tick, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [sessionId]);
  return pointer;
}

/**
 * The page the agent is working on, while it works.
 *
 * With Castfy's own recording browser (recording-window.js) this is that
 * browser, live: the user can click and type in it, to sign in to a site
 * before the agent goes on. Otherwise it is castfy0's live frame, to watch.
 */
export function LiveView({ sessionId }: { sessionId: string | null }) {
  const { step } = useLive();
  const frame = useRecordingFrame();
  const polled = usePolledFrame(sessionId, !frame);
  const pointer = useLivePointer(sessionId);
  const surface = useRef<HTMLDivElement>(null);
  const moveQueued = useRef<RecordingInput | null>(null);

  const shown = frame?.url ?? polled;
  const viewport = frame?.viewport ??
    pointer?.viewport ?? { width: 1280, height: 720 };
  const interactive = Boolean(frame);

  /** A mouse position in the page's CSS pixels. */
  const at = (e: React.MouseEvent) => {
    const rect = surface.current?.getBoundingClientRect();
    if (!rect?.width) {
      return { x: 0, y: 0 };
    }
    return {
      x: ((e.clientX - rect.left) / rect.width) * viewport.width,
      y: ((e.clientY - rect.top) / rect.height) * viewport.height,
    };
  };
  const send = (event: RecordingInput) => {
    if (interactive) {
      bridge.recordingInput?.(event);
    }
  };
  const mouse =
    (type: "mouseDown" | "mouseUp") => (e: React.MouseEvent<HTMLDivElement>) => {
      if (type === "mouseDown") {
        surface.current?.focus();
      }
      send({
        type,
        ...at(e),
        button: BUTTONS[e.button] ?? "left",
        clickCount: e.detail || 1,
        modifiers: modifiers(e),
      });
    };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drags: a resting hand on the mouse would move the page's pointer
    // under the agent and change what is hovered in the recording.
    if (e.buttons === 0) {
      return;
    }
    // At most one move per frame.
    const pending = moveQueued.current;
    moveQueued.current = { type: "mouseMove", ...at(e), modifiers: modifiers(e) };
    if (!pending) {
      requestAnimationFrame(() => {
        if (moveQueued.current) {
          send(moveQueued.current);
        }
        moveQueued.current = null;
      });
    }
  };
  const key = (type: "keyDown" | "keyUp") => (e: React.KeyboardEvent) => {
    if (!interactive) {
      return;
    }
    // The page has the keyboard: studio shortcuts must not fire meanwhile.
    e.preventDefault();
    e.stopPropagation();
    const keyCode = KEY_CODES[e.key] ?? e.key;
    send({ type, keyCode, modifiers: modifiers(e) });
    // Text arrives as a character event, as Chromium types it.
    if (type === "keyDown" && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      send({ type: "char", keyCode: e.key, modifiers: modifiers(e) });
    }
  };

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-black">
      {shown ? (
        // biome-ignore lint/a11y: a live browser surface; its contents are the page's own controls.
        <div
          className={`relative max-h-full max-w-full outline-none ${interactive ? "cursor-default" : ""}`}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={key("keyDown")}
          onKeyUp={key("keyUp")}
          onMouseDown={mouse("mouseDown")}
          onMouseMove={onMouseMove}
          onMouseUp={mouse("mouseUp")}
          onWheel={(e) =>
            send({
              type: "mouseWheel",
              ...at(e),
              deltaX: -e.deltaX,
              deltaY: -e.deltaY,
            })
          }
          ref={surface}
          role={interactive ? "application" : undefined}
          style={{
            aspectRatio: `${viewport.width} / ${viewport.height}`,
            height: "100%",
          }}
          tabIndex={interactive ? 0 : undefined}
        >
          <img
            alt="The page the agent is recording"
            className="pointer-events-none h-full w-full select-none object-contain"
            draggable={false}
            src={shown}
          />
          {pointer && <LiveCursor pointer={pointer} />}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">Opening the browser…</p>
      )}
      <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 font-medium text-[11px] text-white backdrop-blur">
        <span className="size-1.5 rounded-full bg-red-500" />
        LIVE
      </span>
      {interactive && (
        <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
          You can click and type here, e.g. to sign in
        </span>
      )}
      {step && (
        <span className="pointer-events-none absolute bottom-3 left-3 max-w-[80%] truncate rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white backdrop-blur">
          {step}
        </span>
      )}
    </div>
  );
}

/** The arrow castfy0 used, at the same size relative to the page. */
function LiveCursor({ pointer }: { pointer: LivePointer }) {
  const { width, height } = pointer.viewport;
  const moving = pointer.type === "move" && pointer.durationMs;
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute drop-shadow"
      fill="none"
      style={{
        left: `${((pointer.x - 2) / width) * 100}%`,
        top: `${((pointer.y - 2) / height) * 100}%`,
        width: `${(32 / width) * 100}%`,
        // easeOutCubic, as the agent's pointer moves.
        transition: moving
          ? `left ${pointer.durationMs}ms cubic-bezier(0.33, 1, 0.68, 1), top ${pointer.durationMs}ms cubic-bezier(0.33, 1, 0.68, 1)`
          : "none",
      }}
      viewBox="4 2 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35Z"
        fill="#000"
        stroke="#fff"
        strokeWidth="1.5"
      />
    </svg>
  );
}
