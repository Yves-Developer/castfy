"use client";
import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useState } from "react";
import { useBackgroundStore } from "@/lib/store";
import { StudioComposition } from "./comp";
import { calculateMetadata } from "./meta";
export function RemotionPlayer({
  onDurationInFrames,
  onFrameChange,
  onMuteChange,
  onPlaybackChange,
  onVolumeChange,
  ref,
}: {
  onDurationInFrames?: (frames: number) => void;
  onFrameChange?: (frame: number) => void;
  onMuteChange?: (isMuted: boolean) => void;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onVolumeChange?: (volume: number) => void;
  ref: React.RefObject<PlayerRef | null>;
}) {
  const { backgroundConfig, generatedVideoUrl, imageOverlays } =
    useBackgroundStore();
  const [durationInFrames, setDurationInFrames] = useState(1); // 1 frame @ 30fps = 00:00

  useEffect(() => {
    let cancelled = false;

    // A project exists before its recording does. Probing an empty src throws
    // a MediaError, so there is nothing to measure until the agent has run.
    if (!generatedVideoUrl) {
      setDurationInFrames(1);
      onDurationInFrames?.(1);
      return;
    }

    Promise.resolve(
      calculateMetadata({
        props: { url: generatedVideoUrl ?? "" },
        defaultProps: { url: generatedVideoUrl ?? "" },
        abortSignal: new AbortController().signal,
        compositionId: "StudioComposition",
        isRendering: false,
      })
    )
      .then((meta) => {
        if (!cancelled) {
          const duration = meta?.durationInFrames ?? 1;
          setDurationInFrames(duration);
          onDurationInFrames?.(duration);
        }
      })
      .catch((err) => {
        console.error("Failed to calculate video metadata", err);
        // consider surfacing an error state to the user here
      });

    return () => {
      cancelled = true;
    };
    // generatedVideoUrl belongs here. Without it this measured once, on mount,
    // when the url was still null — leaving durationInFrames at 1 forever, so
    // every seek clamped to frame 0 and playback could not advance. The cloud
    // app got away with it because its url was a module constant; here it
    // arrives asynchronously from the main process.
  }, [onDurationInFrames, generatedVideoUrl]);

  useEffect(() => {
    const player = ref.current;
    if (!player) {
      return;
    }

    const handleFrameChange = ({ detail }: { detail: { frame: number } }) => {
      onFrameChange?.(detail.frame);
    };
    const handlePlay = () => onPlaybackChange?.(true);
    const handlePause = () => onPlaybackChange?.(false);
    const handleMuteChange = ({ detail }: { detail: { isMuted: boolean } }) => {
      onMuteChange?.(detail.isMuted);
    };
    const handleVolumeChange = ({ detail }: { detail: { volume: number } }) => {
      onVolumeChange?.(detail.volume);
    };

    onFrameChange?.(player.getCurrentFrame());
    onMuteChange?.(player.isMuted());
    onPlaybackChange?.(player.isPlaying());
    onVolumeChange?.(player.getVolume());
    player.addEventListener("frameupdate", handleFrameChange);
    player.addEventListener("seeked", handleFrameChange);
    player.addEventListener("play", handlePlay);
    player.addEventListener("pause", handlePause);
    player.addEventListener("mutechange", handleMuteChange);
    player.addEventListener("volumechange", handleVolumeChange);

    return () => {
      player.removeEventListener("frameupdate", handleFrameChange);
      player.removeEventListener("seeked", handleFrameChange);
      player.removeEventListener("play", handlePlay);
      player.removeEventListener("pause", handlePause);
      player.removeEventListener("mutechange", handleMuteChange);
      player.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [onFrameChange, onMuteChange, onPlaybackChange, onVolumeChange, ref]);

  if (!generatedVideoUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-center">
        <p className="font-semibold text-xs">Nothing recorded yet</p>
        <p className="max-w-60 text-balance text-muted-foreground text-xs">
          Use the agent panel to record this demo. It will play here when the
          run finishes.
        </p>
      </div>
    );
  }

  return (
    <Player
      acknowledgeRemotionLicense
      clickToPlay
      component={StudioComposition}
      compositionHeight={1080}
      compositionWidth={1920}
      controls
      doubleClickToFullscreen
      durationInFrames={durationInFrames}
      fps={30}
      inputProps={{
        url: generatedVideoUrl ?? "",
        backgroundConfig,
        imageOverlays,
      }}
      loop
      ref={ref}
      showPlaybackRateControl
      showVolumeControls
      spaceKeyToPlayOrPause={true}
      style={{ width: "100%" }}
    />
  );
}
