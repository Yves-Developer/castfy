"use client";
import React from "react";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useImageStore } from "@/lib/store";
import { EditorFooter } from "./footer";
import { EditorVideo } from "./video";

const SKIP_SECONDS = 10;

export default function AppVideoEditor() {
  const { selectedAspectRatio } = useImageStore();
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);
  const [volume, setVolume] = React.useState(1);
  const lastVolumeRef = React.useRef(1);

  const videoUrl =
    "https://pub-79872054c8cb4a23b5f90577293ece4f.r2.dev/Framer%20Update_%20CMS%203.0.mp4";

  const currentRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
  const ratioValue = currentRatio
    ? currentRatio.width / currentRatio.height
    : 16 / 9;

  const handleLoadedMetadata = React.useCallback((loadedDuration: number) => {
    setDuration(loadedDuration);
  }, []);

  const handleTimeUpdate = React.useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handlePlay = React.useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = React.useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Slider-driven volume changes ONLY. This is the source of truth
  // when the user explicitly drags the volume control.
  const handleVolumeChange = React.useCallback((nextVolume: number) => {
    const video = videoRef.current;
    const volumeValue = Math.max(0, Math.min(1, nextVolume));
    if (video) {
      video.volume = volumeValue;
      video.muted = volumeValue === 0;
    }
    if (volumeValue > 0) {
      lastVolumeRef.current = volumeValue;
    }
    setVolume(volumeValue);
    setIsMuted(volumeValue === 0);
  }, []);

  // Native <video> element sync (fires on "volumechange" DOM events,
  // including ones caused by setting .muted directly). This must NOT
  // derive `muted` from volume level — it mirrors video.muted as-is,
  // so it never fights with handleToggleMute.
  const handleNativeVolumeChange = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    setVolume(video.volume);
    setIsMuted(video.muted);
    if (video.volume > 0) {
      lastVolumeRef.current = video.volume;
    }
  }, []);

  const handleTogglePlay = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused || video.ended) {
      video.play().catch((err) => {
        console.error("Video play() failed:", err);
      });
    } else {
      video.pause();
    }
  }, []);

  const handleSkipBack = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.currentTime = Math.max(0, video.currentTime - SKIP_SECONDS);
  }, []);

  const handleSkipForward = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.currentTime = Math.min(
      video.duration || Number.POSITIVE_INFINITY,
      video.currentTime + SKIP_SECONDS
    );
  }, []);

  const handleToggleMute = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const nextMuted = !video.muted;
    video.muted = nextMuted;

    if (!nextMuted && video.volume === 0) {
      const restoredVolume = lastVolumeRef.current || 0.5;
      video.volume = restoredVolume;
      setVolume(restoredVolume);
    }

    setIsMuted(nextMuted);
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setVolume(video.volume);
    setIsMuted(video.muted);
    setIsPlaying(!(video.paused || video.ended));
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
          <EditorVideo
            onLoadedMetadata={handleLoadedMetadata}
            onPause={handlePause}
            onPlay={handlePlay}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={handleNativeVolumeChange}
            ref={videoRef}
            url={videoUrl}
          />
        </div>
      </div>
      <EditorFooter
        currentTime={currentTime}
        duration={duration}
        isMuted={isMuted}
        isPlaying={isPlaying}
        onPlayPause={handleTogglePlay}
        onSkipBack={handleSkipBack}
        onSkipForward={handleSkipForward}
        onToggleMute={handleToggleMute}
        onVolumeChange={handleVolumeChange}
        volume={volume}
      />
    </div>
  );
}
