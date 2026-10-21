"use client";
import { cn } from "@castfy/ui/lib/utils";
import {
  FilmIcon,
  MicIcon,
  MinusIcon,
  PlusIcon,
  ScissorsIcon,
  TypeIcon,
  XIcon,
  ZoomInIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bridge, type CutRange, type Timeline } from "@/lib/bridge";
import { useBackgroundStore } from "@/lib/store";
import { planShots, type Shot, shotEndMs } from "../../../../../remotion/zoom";
import type { CutsApi } from "../use-cuts";
import { useClipThumbnails, useWaveform } from "./timeline-media";

const FPS = 30;

/**
 * The editor's timeline, laid out like a video editor's (CapCut's): a toolbar
 * with the timeline zoom, a time ruler, a video track of clips with their
 * thumbnails, and a track per kind of thing on top of it (zoom, voice,
 * captions, cuts), with one playhead through all of them.
 *
 * Everything is placed in percent of the scrollable track width, which the
 * timeline zoom widens; at zoom 1 the whole recording fits.
 */

/** Colour carries why something was trimmed, not just that it was. */
const CUT_TONE: Record<string, string> = {
  agent_marked: "bg-amber-500/45 hover:bg-amber-500/60",
  idle: "bg-sky-500/40 hover:bg-sky-500/55",
  stillness: "bg-sky-500/40 hover:bg-sky-500/55",
  auto: "bg-zinc-500/45 hover:bg-zinc-500/60",
};

const CUT_LABEL: Record<string, string> = {
  agent_marked: "Marked by the agent",
  idle: "Idle gap",
  stillness: "Nothing moving",
  auto: "Trimmed",
};

const MAX_TIMELINE_ZOOM = 8;
/** Labels on the ruler stay at least this far apart. */
const MIN_LABEL_PX = 64;
/** Label spacings to choose from, seconds. */
const LABEL_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300];
/** Track heights, px: the video track is the tall one, as in an editor. */
const RULER_H = 22;
const VIDEO_H = 52;
const LANE_H = 24;
const VOICE_H = 32;

function timecode(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const frames = Math.floor((total % 1) * FPS);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

function rulerLabel(seconds: number): string {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function StudioTimelines({
  currentFrame,
  durationInFrames,
  onSeek,
  timeline,
  cutsApi,
  sessionId,
}: {
  currentFrame: number;
  durationInFrames: number;
  onSeek: (frame: number) => void;
  timeline?: Timeline;
  cutsApi?: CutsApi;
  sessionId?: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  /** Which cut edge is being dragged, so the scrubber ignores those events. */
  const [dragEdge, setDragEdge] = useState<{ index: number; edge: "start" | "end" } | null>(
    null
  );
  const [timelineZoom, setTimelineZoom] = useState(1);

  const totalMs = timeline?.totalDurationMs ?? 0;
  const videoUrl = useBackgroundStore((s) => s.generatedVideoUrl);
  const zoom = useZoomEdits(sessionId);

  /** The clips of the video track: a segment recording's, else one per step. */
  const clips = useMemo(() => {
    if (timeline?.clips?.length) {
      return timeline.clips;
    }
    return (timeline?.steps ?? [])
      .filter((s) => !(s.excluded || s.failed))
      .map((s) => ({
        id: s.id,
        label: s.description,
        startMs: s.startMs,
        endMs: s.startMs + Math.max(1, s.durationMs),
      }));
  }, [timeline]);
  const thumbs = useClipThumbnails(videoUrl, clips);
  const wave = useWaveform(timeline?.narration.length ? videoUrl : null);

  const ratioFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) {
      return 0;
    }
    const rect = track.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }, []);

  const frameFromClientX = useCallback(
    (clientX: number) => {
      if (durationInFrames <= 1) {
        return 0;
      }
      return Math.round(ratioFromClientX(clientX) * (durationInFrames - 1));
    },
    [durationInFrames, ratioFromClientX]
  );

  /**
   * Scrubbing is handled entirely on the scrubber element: capture, move and
   * release on one element is what makes a drag survive the pointer leaving
   * the track.
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
      if (!isDragging) {
        return;
      }
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
      if (!dragEdge) {
        return;
      }
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

  // Zoomed in, the view follows the playhead as it plays.
  useEffect(() => {
    const scroller = scrollRef.current;
    const track = trackRef.current;
    if (!(scroller && track) || timelineZoom === 1 || isDragging) {
      return;
    }
    const x = (playheadPercent / 100) * track.scrollWidth;
    const margin = 48;
    if (x < scroller.scrollLeft + margin || x > scroller.scrollLeft + scroller.clientWidth - margin) {
      scroller.scrollLeft = Math.max(0, x - margin);
    }
  }, [playheadPercent, timelineZoom, isDragging]);

  const pct = (ms: number) => (totalMs > 0 ? (ms / totalMs) * 100 : 0);
  const cuts = cutsApi?.cuts ?? timeline?.aiCuts ?? [];
  const showCuts = Boolean(cutsApi) || cuts.length > 0;

  return (
    <div
      className="flex flex-col overflow-hidden rounded-lg border border-[#2a2a2e] bg-[#161618] text-[#c9c9cf]"
      data-castfy-state={JSON.stringify({
        currentFrame,
        durationInFrames,
        totalMs,
        cuts: cuts.length,
        steps: timeline?.steps.length ?? 0,
        hasTimeline: Boolean(timeline),
      })}
    >
      {/* Toolbar: where the playhead is, and the timeline zoom */}
      <div className="flex h-8 items-center justify-between border-[#2a2a2e] border-b bg-[#1c1c1f] px-3 text-[11px]">
        <div className="flex items-center gap-3 tabular-nums">
          <span className="text-white">{timecode(progress * totalMs)}</span>
          <span className="text-[#6e6e76]">/ {timecode(totalMs)}</span>
          {zoom.removed > 0 ? (
            <button
              className="rounded px-1.5 py-0.5 text-[#9b8cff] hover:bg-white/5"
              onClick={zoom.restore}
              type="button"
            >
              Restore {zoom.removed} zoom{zoom.removed === 1 ? "" : "s"}
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Zoom the timeline out"
            className="rounded p-0.5 text-[#8a8a92] hover:bg-white/5 hover:text-white disabled:opacity-30"
            disabled={timelineZoom <= 1}
            onClick={() => setTimelineZoom((z) => Math.max(1, z / 1.5))}
            type="button"
          >
            <MinusIcon className="size-3.5" />
          </button>
          <input
            aria-label="Timeline zoom"
            className="h-1 w-24 cursor-pointer accent-white"
            max={MAX_TIMELINE_ZOOM}
            min={1}
            onChange={(e) => setTimelineZoom(Number(e.target.value))}
            step={0.1}
            type="range"
            value={timelineZoom}
          />
          <button
            aria-label="Zoom the timeline in"
            className="rounded p-0.5 text-[#8a8a92] hover:bg-white/5 hover:text-white disabled:opacity-30"
            disabled={timelineZoom >= MAX_TIMELINE_ZOOM}
            onClick={() => setTimelineZoom((z) => Math.min(MAX_TIMELINE_ZOOM, z * 1.5))}
            type="button"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </div>
      </div>

      {timeline ? (
        <div className="flex">
          {/* Track headers */}
          <div className="flex w-10 flex-none flex-col border-[#2a2a2e] border-r bg-[#1c1c1f]">
            <div style={{ height: RULER_H }} />
            <TrackHeader height={VIDEO_H} icon={<FilmIcon className="size-3.5" />} label="Video" />
            {zoom.available ? (
              <TrackHeader height={LANE_H} icon={<ZoomInIcon className="size-3.5" />} label="Zoom" />
            ) : null}
            {timeline.narration.length > 0 ? (
              <>
                <TrackHeader height={VOICE_H} icon={<MicIcon className="size-3.5" />} label="Voice" />
                <TrackHeader height={LANE_H} icon={<TypeIcon className="size-3.5" />} label="Captions" />
              </>
            ) : null}
            {showCuts ? (
              <TrackHeader height={LANE_H} icon={<ScissorsIcon className="size-3.5" />} label="Cuts" />
            ) : null}
          </div>

          {/* Tracks, scrolling sideways when the timeline is zoomed in */}
          <div
            className={cn("min-w-0 flex-1", timelineZoom > 1 ? "overflow-x-auto" : "overflow-x-hidden")}
            ref={scrollRef}
          >
            <div className="relative" style={{ width: `${timelineZoom * 100}%` }}>
              <Ruler
                onPointerCancel={handleScrubUp}
                onPointerDown={handleScrubDown}
                onPointerMove={handleScrubMove}
                onPointerUp={handleScrubUp}
                playheadPercent={playheadPercent}
                totalMs={totalMs}
                trackRef={trackRef}
              />

              <Lane height={VIDEO_H}>
                {clips.map((clip) => (
                  <VideoClip
                    key={clip.id}
                    label={clip.label}
                    left={pct(clip.startMs)}
                    seconds={(clip.endMs - clip.startMs) / 1000}
                    thumb={thumbs.get(clip.startMs)}
                    width={pct(clip.endMs - clip.startMs)}
                  />
                ))}
              </Lane>

              {zoom.available ? (
                <Lane height={LANE_H}>
                  {zoom.shots.map((shot) => (
                    <ZoomClip
                      key={shot.eventMs[0]}
                      left={pct(shot.startMs)}
                      onRemove={() => zoom.remove(shot)}
                      scale={shot.scale}
                      width={pct(shotEndMs(shot) - shot.startMs)}
                    />
                  ))}
                </Lane>
              ) : null}

              {timeline.narration.length > 0 ? (
                <>
                  <Lane height={VOICE_H}>
                    {timeline.narration.map((seg) => (
                      <VoiceClip
                        endMs={seg.endMs}
                        key={`${seg.startMs}-${seg.stepId}`}
                        left={pct(seg.startMs)}
                        startMs={seg.startMs}
                        text={seg.text}
                        wave={wave}
                        width={pct(seg.endMs - seg.startMs)}
                      />
                    ))}
                  </Lane>
                  <Lane height={LANE_H}>
                    {timeline.narration.map((seg) => (
                      <div
                        className="absolute inset-y-[3px] flex items-center overflow-hidden rounded-[4px] bg-[#c9822f] px-1.5 text-[10px] text-white"
                        key={`${seg.startMs}-${seg.stepId}`}
                        style={{
                          left: `${pct(seg.startMs)}%`,
                          width: `${Math.max(0.4, pct(seg.endMs - seg.startMs))}%`,
                        }}
                        title={seg.text}
                      >
                        <span className="truncate">{seg.text}</span>
                      </div>
                    ))}
                  </Lane>
                </>
              ) : null}

              {showCuts ? (
                <Lane height={LANE_H}>
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
                </Lane>
              ) : null}

              <Playhead percent={playheadPercent} />
            </div>
          </div>
        </div>
      ) : (
        <p className="py-4 text-center text-[11px] text-[#6e6e76]">
          Record this demo to see its timeline.
        </p>
      )}
    </div>
  );
}

function TrackHeader({
  height,
  icon,
  label,
}: {
  height: number;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex items-center justify-center border-[#232326] border-t text-[#7c7c84]"
      style={{ height }}
      title={label}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function Lane({ height, children }: { height: number; children: React.ReactNode }) {
  return (
    <div className="relative border-[#232326] border-t" style={{ height }}>
      {children}
    </div>
  );
}

/** The time ruler, which is also where the playhead is dragged. */
function Ruler({
  totalMs,
  playheadPercent,
  trackRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: {
  totalMs: number;
  playheadPercent: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = trackRef.current;
    if (!el) {
      return;
    }
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [trackRef]);

  const seconds = totalMs / 1000;
  const pxPerSecond = seconds > 0 ? width / seconds : 0;
  const step = LABEL_STEPS.find((s) => s * pxPerSecond >= MIN_LABEL_PX) ?? LABEL_STEPS.at(-1) ?? 60;
  const minor = step / 5;
  const ticks: Array<{ at: number; major: boolean }> = [];
  for (let t = 0; t <= seconds + 1e-6 && minor > 0; t += minor) {
    const at = Math.round(t * 1000) / 1000;
    // No label so close to the end that it would be cut off.
    const fits = (seconds - at) * pxPerSecond >= MIN_LABEL_PX / 2;
    ticks.push({ at, major: Math.abs(at / step - Math.round(at / step)) < 1e-6 && fits });
  }

  return (
    <div
      className="relative cursor-pointer touch-none select-none"
      data-castfy="scrubber"
      onPointerCancel={onPointerCancel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      ref={trackRef}
      style={{ height: RULER_H }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 bg-white/[0.03]"
        data-castfy="progress"
        style={{ width: `${playheadPercent}%` }}
      />
      {ticks.map((tick) => (
        <div
          className="pointer-events-none absolute bottom-0"
          key={tick.at}
          style={{ left: `${(tick.at / Math.max(seconds, 1e-6)) * 100}%` }}
        >
          <div className={cn("w-px bg-[#46464d]", tick.major ? "h-2" : "h-1")} />
          {tick.major ? (
            <span className="-translate-y-full absolute top-[-2px] left-1 text-[9px] text-[#7c7c84] tabular-nums">
              {rulerLabel(tick.at)}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** A white playhead with its handle in the ruler, through every track. */
function Playhead({ percent }: { percent: number }) {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 left-0">
      <div className="absolute inset-y-0 w-0" data-castfy="playhead" style={{ left: `${percent}%` }}>
        <div className="-translate-x-1/2 absolute top-0 h-3 w-2.5 rounded-b-[3px] rounded-t-[1px] bg-white shadow" />
        <div className="-translate-x-1/2 absolute top-0 bottom-0 w-px bg-white" />
      </div>
    </div>
  );
}

function VideoClip({
  label,
  left,
  width,
  seconds,
  thumb,
}: {
  label: string;
  left: number;
  width: number;
  seconds: number;
  thumb?: string;
}) {
  return (
    <div
      className="absolute inset-y-[3px] overflow-hidden rounded-[5px] border border-[#3b3b42] bg-[#2a2a30]"
      style={{
        left: `${left}%`,
        width: `${Math.max(0.4, width)}%`,
        backgroundImage: thumb ? `url(${thumb})` : undefined,
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
      }}
      title={`${label} — ${seconds.toFixed(1)}s`}
    >
      <div className="absolute inset-x-0 top-0 flex items-center gap-1 bg-gradient-to-b from-black/70 to-transparent px-1.5 pt-0.5 pb-2 text-[9px] text-white">
        <span className="truncate">{label}</span>
        <span className="ml-auto flex-none text-white/70 tabular-nums">{seconds.toFixed(1)}s</span>
      </div>
    </div>
  );
}

function ZoomClip({
  left,
  width,
  scale,
  onRemove,
}: {
  left: number;
  width: number;
  scale: number;
  onRemove: () => void;
}) {
  return (
    <div
      className="group/zoom absolute inset-y-[3px] flex items-center overflow-hidden rounded-[4px] bg-[#6d57e8] px-1.5 text-[10px] text-white transition-colors hover:bg-[#7b67f0]"
      style={{ left: `${left}%`, width: `${Math.max(0.5, width)}%` }}
      title={`Zoom ${scale.toFixed(1)}×`}
    >
      <span className="truncate">Zoom {scale.toFixed(1)}×</span>
      <button
        aria-label="Remove this zoom"
        className="absolute top-1/2 right-0.5 hidden size-3.5 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 group-hover/zoom:flex"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onPointerDown={(e) => e.stopPropagation()}
        type="button"
      >
        <XIcon className="size-2.5" strokeWidth={3} />
      </button>
    </div>
  );
}

/** A voiceover line, drawn as its waveform. */
function VoiceClip({
  left,
  width,
  startMs,
  endMs,
  text,
  wave,
}: {
  left: number;
  width: number;
  startMs: number;
  endMs: number;
  text: string;
  wave: { peaks: Float32Array; peakMs: number } | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!(canvas && wave)) {
      return;
    }
    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "rgba(160, 240, 205, 0.9)";
      const from = Math.floor(startMs / wave.peakMs);
      const to = Math.min(wave.peaks.length, Math.ceil(endMs / wave.peakMs));
      const count = Math.max(1, to - from);
      const barWidth = Math.max(1, ratio);
      const mid = canvas.height / 2;
      for (let x = 0; x < canvas.width; x += barWidth * 2) {
        const peak = wave.peaks[from + Math.floor((x / canvas.width) * count)] ?? 0;
        const h = Math.max(ratio, peak * (canvas.height - 2 * ratio));
        context.fillRect(x, mid - h / 2, barWidth, h);
      }
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [wave, startMs, endMs]);

  return (
    <div
      className="absolute inset-y-[3px] overflow-hidden rounded-[4px] bg-[#1f6b52]"
      style={{ left: `${left}%`, width: `${Math.max(0.4, width)}%` }}
      title={text}
    >
      <canvas className="absolute inset-0 h-full w-full" ref={canvasRef} />
    </div>
  );
}

/**
 * The zooms of the playing recording, and removing them. A removed zoom is
 * saved with the recording (zoom-edits.json), so the export leaves it out too.
 */
function useZoomEdits(sessionId: string | null | undefined) {
  const track = useBackgroundStore((s) => s.zoomTrack);
  const setZoomTrack = useBackgroundStore((s) => s.setZoomTrack);
  const shots = useMemo(() => planShots(track), [track]);
  const offMs = useMemo(
    () => (track?.events ?? []).filter((e) => e.off).map((e) => e.ms),
    [track]
  );
  const removed = useMemo(
    () =>
      planShots(
        track && {
          ...track,
          events: track.events.map((e) => ({ ...e, off: false })),
        }
      ).length - shots.length,
    [track, shots]
  );

  const save = useCallback(
    (off: number[]) => {
      if (!(track && sessionId)) {
        return;
      }
      // At once in the preview; the saved track replaces it when it is back.
      const offSet = new Set(off);
      setZoomTrack({
        ...track,
        events: track.events.map((e) => ({ ...e, off: offSet.has(e.ms) })),
      });
      bridge
        .saveZoomOff(sessionId, off)
        .then((saved) => {
          if (saved) {
            setZoomTrack(saved);
          }
        })
        .catch(() => {
          // The preview already shows the edit; the export would not.
        });
    },
    [track, sessionId, setZoomTrack]
  );

  return {
    available: Boolean(track && sessionId),
    shots,
    removed,
    remove: (shot: Shot) => save([...offMs, ...shot.eventMs]),
    restore: () => save([]),
  };
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
      className={cn("group/cut absolute inset-y-[3px] rounded-[4px] transition-colors", tone)}
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
            className="-top-1 -right-1 absolute hidden size-3.5 items-center justify-center rounded-full bg-white text-black group-hover/cut:flex"
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
