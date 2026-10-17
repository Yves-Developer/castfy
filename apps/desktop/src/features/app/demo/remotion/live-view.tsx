import { useEffect, useState } from "react";
import { liveFrameUrl, useLive } from "@/lib/live-view";

/** How often the live frame is refreshed. castfy0 writes it about as often. */
const REFRESH_MS = 200;

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
        <img
          alt="The page the agent is recording"
          className="h-full w-full object-contain"
          src={shown}
        />
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
