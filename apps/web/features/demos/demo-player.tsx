"use client";

import { Volume2Icon, VolumeXIcon } from "lucide-react";
import { useRef, useState } from "react";
import { PlayButton } from "@/components/play-button";

/**
 * A demo's full video. It starts muted when played; the sound button turns
 * the voiceover on. Nothing loads until it is played.
 */
export function DemoPlayer({
  src,
  poster,
  label,
  aspectRatio,
}: {
  src: string;
  poster: string;
  label: string;
  /** Width over height, from the poster: the export's own shape. */
  aspectRatio: number;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(true);

  const play = () => {
    const el = video.current;
    if (!el) {
      return;
    }
    el.play().catch(() => undefined);
    setStarted(true);
  };

  const toggleSound = () => {
    const el = video.current;
    if (!el) {
      return;
    }
    el.muted = !el.muted;
    setMuted(el.muted);
    if (el.paused) {
      play();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-black shadow-[0_30px_80px_-34px_rgba(10,30,70,0.6)]">
      <video
        aria-label={label}
        className="block w-full"
        controls={started}
        muted={muted}
        playsInline
        poster={poster}
        preload="none"
        ref={video}
        src={src}
        style={{ aspectRatio }}
      />
      {started ? null : (
        <PlayButton aria-label="Play the demo" onClick={play} />
      )}
      <button
        aria-label={muted ? "Turn the voiceover on" : "Mute"}
        className="absolute top-3 right-3 inline-flex h-9 items-center gap-2 rounded-full bg-black/70 px-3.5 font-medium text-[13px] text-white backdrop-blur transition-colors hover:bg-black/85"
        onClick={toggleSound}
        type="button"
      >
        {muted ? (
          <VolumeXIcon className="size-4" />
        ) : (
          <Volume2Icon className="size-4" />
        )}
        {muted ? "Sound off" : "Sound on"}
      </button>
    </div>
  );
}
