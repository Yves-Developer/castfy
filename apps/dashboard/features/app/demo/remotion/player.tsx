"use client";
import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useState } from "react";
import { demoVideoUrl } from "@/config/data";
import { useImageStore } from "@/lib/store";
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
    useImageStore();
  const [durationInFrames, setDurationInFrames] = useState(1); // 1 frame @ 30fps = 00:00

  useEffect(() => {
    let cancelled = false;

    Promise.resolve(
      calculateMetadata({
        props: { url: demoVideoUrl },
        defaultProps: { url: demoVideoUrl },
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
  }, [onDurationInFrames]);

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

  return (
    <Player
      clickToPlay
      component={StudioComposition}
      compositionHeight={1080}
      compositionWidth={1920}
      controls
      doubleClickToFullscreen
      durationInFrames={durationInFrames}
      fps={30}
      inputProps={{
        url: generatedVideoUrl || demoVideoUrl,
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
