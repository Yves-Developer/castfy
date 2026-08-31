"use client";
import { cn } from "@castfy/ui/lib/utils";
import { XIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { CutRange, Timeline } from "@/lib/bridge";
import type { CutsApi } from "../use-cuts";

const FPS = 30;

/** Colour carries why something was trimmed, not just that it was. */
const CUT_TONE: Record<string, string> = {
  agent_marked: "bg-amber-500/35 hover:bg-amber-500/45",
  idle: "bg-sky-500/30 hover:bg-sky-500/40",
  stillness: "bg-sky-500/30 hover:bg-sky-500/40",
  auto: "bg-muted-foreground/30 hover:bg-muted-foreground/40",
};

/** Label column width + gap. The playhead overlay must start after it. */
const GUTTER = "w-9";
const GUTTER_INSET = "left-11";

const CUT_LABEL: Record<string, string> = {
  agent_marked: "Marked by the agent",
  idle: "Idle gap",
  stillness: "Nothing moving",
  auto: "Trimmed",
};

export default function StudioTimelines({
  currentFrame,
  durationInFrames,
  onSeek,
  timeline,
  cutsApi,
}: {
  currentFrame: number;
  durationInFrames: number;
  onSeek: (frame: number) => void;
  timeline?: Timeline;
  cutsApi?: CutsApi;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  /** Which cut edge is being dragged, so the scrubber ignores those events. */
  const [dragEdge, setDragEdge] = useState<{ index: number; edge: "start" | "end" } | null>(null);

  const totalMs = timeline?.totalDurationMs ?? 0;

  const ratioFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const frameFromClientX = useCallback(
    (clientX: number) => {
      if (durationInFrames <= 1) return 0;
      return Math.round(ratioFromClientX(clientX) * (durationInFrames - 1));
    },
    [durationInFrames, ratioFromClientX]
  );

  /**
   * Scrubbing is handled entirely on the scrubber element.
   *
   * It previously captured the pointer on the scrubber but released it on the
   * outer container — a different element, which never held the capture. Keeping
   * capture, move and release on one element is what makes a drag survive the
   * pointer leaving the track.
   */
  const handleScrubDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      onSeek(frameFromClientX(e.clientX));
    },
    [frameFromClientX, onSeek]
  );

  const handleScrubMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      onSeek(frameFromClientX(e.clientX));
    },
    [isDragging, frameFromClientX, onSeek]
  );

  const handleScrubUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsDragging(false);
  }, []);

  /** Dragging a cut edge, likewise self-contained on the handle itself. */
  const handleEdgeMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!dragEdge) return;
      cutsApi?.adjust(dragEdge.index, dragEdge.edge, ratioFromClientX(e.clientX) * totalMs);
    },
    [dragEdge, cutsApi, ratioFromClientX, totalMs]
  );

  const handleEdgeUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragEdge(null);
  }, []);

  const progress = durationInFrames > 1 ? currentFrame / (durationInFrames - 1) : 0;
  const playheadPercent = Math.min(100, Math.max(0, progress * 100));

  const pct = (ms: number) => (totalMs > 0 ? (ms / totalMs) * 100 : 0);
  const cuts = cutsApi?.cuts ?? timeline?.aiCuts ?? [];

  return (
    <div
      className="group relative flex flex-col gap-1.5"
      data-castfy-state={JSON.stringify({
        currentFrame,
        durationInFrames,
        totalMs,
        cuts: cuts.length,
        steps: timeline?.steps.length ?? 0,
        hasTimeline: Boolean(timeline),
      })}
    >
      {/* Scrubber, in the same row shape as the tracks so they share an x-axis */}
      <TrackRow label="Time">
      <div
        className="absolute inset-0 cursor-pointer touch-none rounded-xl bg-muted"
        data-castfy="scrubber"
        onPointerCancel={handleScrubUp}
        onPointerDown={handleScrubDown}
        onPointerMove={handleScrubMove}
        onPointerUp={handleScrubUp}
        ref={trackRef}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 rounded-xl bg-primary/50"
          data-castfy="progress"
          style={{ width: `${playheadPercent}%` }}
        />
      </div>
      </TrackRow>

      {timeline ? (
        <>
          {/* Cuts — the engine's proposal, editable */}
          <TrackRow label="Cuts">
            {cuts.map((cut, index) => (
              <CutBlock
                cut={cut}
                editable={Boolean(cutsApi)}
                key={`${cut.startMs}-${cut.endMs}-${index}`}
                left={pct(cut.startMs)}
                onDragEdge={(edge) => setDragEdge({ index, edge })}
                onEdgeMove={handleEdgeMove}
                onEdgeUp={handleEdgeUp}
                onRemove={() => cutsApi?.remove(index)}
                width={pct(cut.endMs - cut.startMs)}
              />
            ))}
          </TrackRow>

          {/* Steps — what the agent did */}
          <TrackRow label="Steps">
            {timeline.steps.map((step) => (
              <div
                className={cn(
                  "absolute inset-y-0 rounded-md",
                  step.failed
                    ? "bg-destructive/50"
                    : step.excluded
                      ? "bg-muted-foreground/25"
                      : "bg-primary/45"
                )}
                key={step.id}
                style={{
                  left: `${pct(step.startMs)}%`,
                  width: `${Math.max(0.4, pct(step.durationMs))}%`,
                }}
                title={`${step.action} — ${step.description}`}
              />
            ))}
          </TrackRow>

          {/* Narration — only when the recording has any */}
          {timeline.narration.length > 0 ? (
            <TrackRow label="Voice">
              {timeline.narration.map((seg) => (
                <div
                  className="absolute inset-y-0 rounded-md bg-emerald-500/35"
                  key={`${seg.startMs}-${seg.stepId}`}
                  style={{
                    left: `${pct(seg.startMs)}%`,
                    width: `${Math.max(0.4, pct(seg.endMs - seg.startMs))}%`,
                  }}
                  title={seg.text}
                />
              ))}
            </TrackRow>
          ) : null}
        </>
      ) : (
        <p className="py-3 text-center text-[11px] text-muted-foreground">
          Record this demo to see its timeline.
        </p>
      )}

      {/* Playhead across every track, aligned to the track column */}
      <div className={cn("pointer-events-none absolute inset-y-0 right-0", GUTTER_INSET)}>
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground"
          data-castfy="playhead"
          style={{ left: `${playheadPercent}%` }}
        />
      </div>
    </div>
  );
}

function TrackRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          GUTTER,
          "flex-none text-[9px] text-muted-foreground uppercase tracking-wider"
        )}
      >
        {label}
      </span>
      <div className="relative h-4 flex-1 rounded-md bg-muted/60">{children}</div>
    </div>
  );
}

function CutBlock({
  cut,
  left,
  width,
  editable,
  onDragEdge,
  onEdgeMove,
  onEdgeUp,
  onRemove,
}: {
  cut: CutRange;
  left: number;
  width: number;
  editable: boolean;
  onDragEdge: (edge: "start" | "end") => void;
  onEdgeMove: (e: React.PointerEvent<HTMLElement>) => void;
  onEdgeUp: (e: React.PointerEvent<HTMLElement>) => void;
  onRemove: () => void;
}) {
  const tone = CUT_TONE[cut.reason ?? "auto"] ?? CUT_TONE.auto;
  const seconds = ((cut.endMs - cut.startMs) / 1000).toFixed(1);

  return (
    <div
      className={cn("group/cut absolute inset-y-0 rounded-md transition-colors", tone)}
      style={{ left: `${left}%`, width: `${Math.max(0.5, width)}%` }}
      title={`${CUT_LABEL[cut.reason ?? "auto"] ?? "Trimmed"} — ${seconds}s removed`}
    >
      {editable ? (
        <>
          {/* Wide grab targets: these are often only a few pixels across. */}
          <span
            className="-left-1 absolute inset-y-0 w-2 cursor-ew-resize touch-none"
            onPointerCancel={onEdgeUp}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              onDragEdge("start");
            }}
            onPointerMove={onEdgeMove}
            onPointerUp={onEdgeUp}
          />
          <span
            className="-right-1 absolute inset-y-0 w-2 cursor-ew-resize touch-none"
            onPointerCancel={onEdgeUp}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.currentTarget.setPointerCapture(e.pointerId);
              onDragEdge("end");
            }}
            onPointerMove={onEdgeMove}
            onPointerUp={onEdgeUp}
          />
          <button
            aria-label="Keep this part"
            className="-top-1 -right-1 absolute hidden size-3.5 items-center justify-center rounded-full bg-foreground text-background group-hover/cut:flex"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            type="button"
          >
            <XIcon className="size-2.5" strokeWidth={3} />
          </button>
        </>
      ) : null}
    </div>
  );
}

export { FPS };
