"use client";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { PauseIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function HeroVid() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="mt-8 3xl:mb-20 mb-8 overflow-visible md:mt-12 lg:mt-0 lg:mb-4 lg:w-full">
      <div className="relative 3xl:h-[1000px] h-105 overflow-hidden sm:h-130 md:h-150 lg:h-200">
        {/* Poster image with fade and blur effect */}
        <div
          className={
            "absolute inset-0 z-1 w-full transition-all duration-1000 ease-in-out"
          }
        >
          <Image
            alt="Midday dashboard preview"
            className="rounded-lg object-cover transition-all duration-1000 ease-in-out"
            fetchPriority="high"
            fill
            priority
            quality={50}
            sizes="100vw"
            src="https://cdn.midday.ai/video-poster-v2.jpg"
          />
        </div>

        {/* Dashboard overlay - different styles for mobile vs desktop */}
        <div className="absolute inset-0 z-2 flex items-center justify-center p-0 lg:p-4">
          <div className="relative scale-[0.95] md:scale-100 lg:static lg:flex lg:h-full lg:scale-100 lg:flex-col lg:items-center lg:justify-center">
            {/** biome-ignore lint/a11y/useMediaCaption: <explanation */}
            <video
              className="lg:transform-[rotate(-2deg)_skewY(1deg)] lg:filter-[drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] h-auto w-full rounded-lg transition-all duration-700 ease-out md:scale-[0.85]! lg:max-w-[85%] lg:scale-100! lg:object-contain 2xl:max-w-[75%]"
              muted
              onClick={togglePlay}
              preload="metadata"
              ref={videoRef}
            >
              <source
                src="https://pub-79872054c8cb4a23b5f90577293ece4f.r2.dev/Castfy/demo-with-audio-clean.mp4"
                type="video/mp4"
              />
              <track kind="subtitles" label="English" src="/" srcLang="en" />
              Your browser does not support the video tag.
            </video>

            <Button
              className={cn(
                "rounded-full",
                isPlaying
                  ? "absolute right-4 bottom-4"
                  : "absolute inset-0 m-auto"
              )}
              onClick={togglePlay}
              size="icon-lg"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
