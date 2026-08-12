"use client";
import { useCallback, useRef, useState } from "react";

interface StudioTimelinesProps {
  currentFrame: number;
  durationInFrames: number;
  onSeek: (frame: number) => void;
}

export default function StudioTimelines({
  currentFrame,
  durationInFrames,
  onSeek,
}: StudioTimelinesProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const frameFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || durationInFrames <= 1) {
        return 0;
      }
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (clientX - rect.left) / rect.width)
      );
      return Math.round(ratio * (durationInFrames - 1));
    },
    [durationInFrames]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      onSeek(frameFromClientX(e.clientX));
    },
    [frameFromClientX, onSeek]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) {
        return;
      }
      onSeek(frameFromClientX(e.clientX));
    },
    [isDragging, frameFromClientX, onSeek]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    },
    []
  );

  const progress =
    durationInFrames > 1 ? currentFrame / (durationInFrames - 1) : 0;
  const playheadPercent = Math.min(100, Math.max(0, progress * 100));

  return (
    <div className="group relative flex flex-col gap-2">
      {/* Main scrubber / video track */}
      <div
        className="relative h-5 w-full cursor-pointer touch-none rounded-xl bg-muted"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={trackRef}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-xl bg-primary/50"
          style={{ width: `${playheadPercent}%` }}
        />
      </div>

      {/* Static overlay tracks (visual only for now) */}
      <div className="flex justify-around">
        <div className="h-5 w-1/4 rounded-xl bg-primary/50" />
        <div className="h-5 w-1/3 rounded-xl bg-muted" />
      </div>
      <div className="flex justify-end">
        <div className="h-5 w-1/2 rounded-xl bg-primary/50" />
      </div>

      {/* Playhead line across all tracks */}
      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-foreground"
        style={{ left: `${playheadPercent}%` }}
      />
    </div>
  );
}
