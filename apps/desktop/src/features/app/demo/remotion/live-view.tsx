import { useEffect, useState } from "react";
import { liveFrameUrl, livePointerUrl, useLive } from "@/lib/live-view";

/** How often the live frame is refreshed. castfy0 writes it about as often. */
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

/**
 * The page the agent is working on, while it works.
 *
 * Each frame is loaded off-screen and swapped in only once it has decoded, so
 * the view never flashes blank between frames or when the file is briefly
 * missing (it is replaced by a rename, and removed when recording stops).
 */
export function LiveView({ sessionId }: { sessionId: string }) {
  const { step } = useLive();
  const [shown, setShown] = useState<string | null>(null);
  const [pointer, setPointer] = useState<LivePointer | null>(null);

  useEffect(() => {
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
      // The cursor is not in the frame (castfy0 draws it after recording), so
      // it is drawn here from where the agent last moved it.
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

  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border bg-black">
      {shown ? (
        <div
          className="relative max-h-full max-w-full"
          style={{
            aspectRatio: pointer
              ? `${pointer.viewport.width} / ${pointer.viewport.height}`
              : "16 / 9",
            height: "100%",
          }}
        >
          <img
            alt="The page the agent is recording"
            className="h-full w-full object-contain"
            src={shown}
          />
          {pointer && <LiveCursor pointer={pointer} />}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">Opening the browser…</p>
      )}
      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 font-medium text-[11px] text-white backdrop-blur">
        <span className="size-1.5 rounded-full bg-red-500" />
        LIVE
      </span>
      {step && (
        <span className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-full bg-black/70 px-2.5 py-1 text-[11px] text-white backdrop-blur">
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
