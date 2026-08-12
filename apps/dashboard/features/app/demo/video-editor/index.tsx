"use client";
import type { PlayerRef } from "@remotion/player";
import { useCallback, useRef, useState } from "react";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useImageStore } from "@/lib/store";
import { RemotionPlayer } from "../remotion/player";
import { EditorFooter } from "./footer";

const SKIP_SECONDS = 10;
const FPS = 30;
export default function AppVideoEditor() {
  const { selectedAspectRatio } = useImageStore();

  const currentRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
  const ratioValue =
    currentRatio && currentRatio.width > 0 && currentRatio.height > 0
      ? currentRatio.width / currentRatio.height
      : 16 / 9;
  const [durationInFrames, setDurationInFrames] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const playerRef = useRef<PlayerRef>(null);

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

  const handleFrameChange = useCallback((frame: number) => {
    setCurrentTime(frame / FPS);
  }, []);

  return (
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
  );
}
