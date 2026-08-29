"use client";
import type { PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useRef, useState } from "react";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useBackgroundStore } from "@/lib/store";
import { useStudioProject, useStudioSource } from "../use-project";
import { nextPlayablePosition, useCuts } from "../use-cuts";
import { CutBar } from "./cut-bar";
import { RemotionPlayer } from "../remotion/player";
import { EditorFooter } from "./footer";
import StudioTimelines from "./timelines";

const SKIP_SECONDS = 10;
const FPS = 30;
export default function AppVideoEditor() {
  const { selectedAspectRatio } = useBackgroundStore();
  /**
   * Defaults to "result": the AI's clean cut, with narration — the thing that
   * gets exported, so what you watch is what you ship.
   *
   * "edit" plays the raw recording and steps over cuts. It works, but stays
   * opt-in until cut editing is finished, because cut ranges are measured in
   * raw-footage time and the clean variant is a different length.
   */
  const [mode, setMode] = useState<"edit" | "result">("result");
  const { project, slug } = useStudioProject();
  // The only place that decides which video plays.
  useStudioSource(project, mode);
  const cutsApi = useCuts(project, slug);
  const timeline = project?.session?.timeline;
  const previewCuts = mode === "edit";

  const currentRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
  const ratioValue =
    currentRatio && currentRatio.width > 0 && currentRatio.height > 0
      ? currentRatio.width / currentRatio.height
      : 16 / 9;
  const [durationInFrames, setDurationInFrames] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const playerRef = useRef<PlayerRef>(null);
  /** Last frame skipped to, so a bad landing cannot become a seek loop. */
  const lastJumpRef = useRef<number | null>(null);
  /** Project whose opening position has been set, so it happens once. */
  const positionedFor = useRef<string | null>(null);

  const skipForward = useCallback(() => {
    const current = playerRef.current;
    if (!current) {
      return;
    }
    const target = current.getCurrentFrame() + SKIP_SECONDS * FPS;
    current.seekTo(Math.min(target, durationInFrames - 1));
  }, [durationInFrames]);

  const skipBackward = useCallback(() => {
    const current = playerRef.current;
    if (!current) {
      return;
    }
    current.seekTo(Math.max(0, current.getCurrentFrame() - SKIP_SECONDS * FPS));
  }, []);

  const handleTogglePlay = () => {
    playerRef.current?.toggle();
  };

  const handleToggleMute = () => {
    const player = playerRef.current;
    if (!player) {
      return;
    }

    if (player.isMuted()) {
      player.unmute();
    } else {
      player.mute();
    }
  };
  const handleVolumeChange = (newVolume: number) => {
    playerRef.current?.setVolume(newVolume);
    setVolume(newVolume);
  };

  const handleDurationInFrames = useCallback((frames: number) => {
    setDurationInFrames(frames);
    setDuration(frames / FPS);
  }, []);

  const seekToFrame = useCallback(
    (frame: number) => {
      const current = playerRef.current;
      if (!current) {
        return;
      }
      const clamped = Math.min(
        Math.max(0, frame),
        Math.max(0, durationInFrames - 1)
      );
      current.seekTo(clamped);
    },
    [durationInFrames]
  );

  /**
   * Open on content, not on the blank frame a recording starts with.
   *
   * Raw footage almost always begins on an unloaded page — which is exactly why
   * the engine's first cut usually covers it. Landing there makes the editor
   * look broken, so the playhead starts at the first kept moment instead.
   */
  useEffect(() => {
    if (!slug || durationInFrames <= 1) return;
    if (positionedFor.current === slug) return;
    positionedFor.current = slug;

    if (!previewCuts || cutsApi.cuts.length === 0) return;
    const firstKept = nextPlayablePosition(0, cutsApi.cuts);
    if (firstKept === null) return;

    const frame = Math.min(Math.ceil((firstKept / 1000) * FPS), durationInFrames - 1);
    playerRef.current?.seekTo(frame);
  }, [slug, durationInFrames, previewCuts, cutsApi.cuts, mode]);

  /**
   * Steps the playhead over cut ranges as it reaches them, so the edit can be
   * judged immediately. Nothing is rendered until it is applied — this is the
   * clean cut as it *would* be, played out of the raw footage.
   */
  const handleFrameChange = useCallback(
    (frame: number) => {
      /**
       * Reflect the player's position first, always.
       *
       * Skipping used to return before this, so the playhead froze at the last
       * kept frame — and with cuts removing most of a recording, that is nearly
       * all the time. The position is true whether or not a skip follows.
       */
      setCurrentFrame(frame);
      setCurrentTime(frame / FPS);

      // durationInFrames is 1 until the player resolves the video's metadata.
      // Skipping before then clamped every jump to frame 0 — which sits inside
      // the first cut, so it seeked to 0 over and over.
      const ready = durationInFrames > 1;
      if (!(previewCuts && isPlaying && ready && cutsApi.cuts.length > 0)) {
        lastJumpRef.current = null;
        return;
      }

      const ms = (frame / FPS) * 1000;
      const jumpTo = nextPlayablePosition(ms, cutsApi.cuts);
      if (jumpTo === null) {
        lastJumpRef.current = null;
        return;
      }

      /**
       * ceil, not round: a cut ending at 10,378ms rounds to frame 311, which
       * sits at 10,366ms — still inside the cut. It then skips again, lands on
       * the same frame, and playback never advances.
       */
      const target = Math.ceil((jumpTo / 1000) * FPS);
      const lastFrame = durationInFrames - 1;

      if (target > lastFrame) {
        // Everything from here to the end is cut. Stop, rather than seek
        // backwards into footage that was just skipped.
        playerRef.current?.pause();
        return;
      }

      // Never seek to where we already are, whatever the arithmetic says.
      if (target !== frame && target !== lastJumpRef.current) {
        lastJumpRef.current = target;
        playerRef.current?.seekTo(target);
      }
    },
    [previewCuts, isPlaying, cutsApi.cuts, durationInFrames]
  );

  return (
    <>
      <div className="flex h-full flex-col gap-4 px-2.5 py-4">
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-lg"
            style={{
              aspectRatio: `${ratioValue}`,
              height: "100%",
              maxHeight: "70vh",
            }}
          >
            <RemotionPlayer
              onDurationInFrames={handleDurationInFrames}
              onFrameChange={handleFrameChange}
              onMuteChange={setIsMuted}
              onPlaybackChange={setIsPlaying}
              onVolumeChange={setVolume}
              ref={playerRef}
            />
          </div>
        </div>
        <EditorFooter
          currentTime={currentTime}
          duration={duration}
          isMuted={isMuted}
          isPlaying={isPlaying}
          onPlayPause={handleTogglePlay}
          onSkipBack={skipBackward}
          onSkipForward={skipForward}
          onToggleMute={handleToggleMute}
          onVolumeChange={handleVolumeChange}
          volume={volume}
        />
      </div>
      <footer className="mt-auto flex flex-col gap-2 border-t p-2.5">
        <CutBar
          cutsApi={cutsApi}
          hasResult={Boolean(
            project?.session?.videos.audioClean ?? project?.session?.videos.audio
          )}
          mode={mode}
          onModeChange={setMode}
          visible={Boolean(timeline)}
        />
        <StudioTimelines
          currentFrame={currentFrame}
          cutsApi={mode === "edit" ? cutsApi : undefined}
          durationInFrames={durationInFrames}
          onSeek={seekToFrame}
          /**
           * Tracks only in edit mode. They are positioned in raw-footage time,
           * and the clean variant is a different length — drawing them over it
           * would put every cut and step in the wrong place.
           */
          timeline={mode === "edit" ? timeline : undefined}
        />
      </footer>
    </>
  );
}
