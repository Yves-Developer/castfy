"use client";

import { useEffect, useRef, useState } from "react";
import LoginTestimonials from "./login-testimonials";

export function LoginVideoBackground() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
    };

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
    };

    const handleCanPlayThrough = () => {
      setIsVideoLoaded(true);
    };

    // Check if video is already loaded
    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
    }

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("canplaythrough", handleCanPlayThrough);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, []);

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
      {/* Poster image with blur effect */}
      <div
        className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out ${
          isVideoLoaded ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{
          filter: isVideoLoaded ? "blur(0px)" : "blur(1px)",
        }}
      >
        {/** biome-ignore lint/correctness/useImageSize: <explanation */}
        {/** biome-ignore lint/performance/noImgElement: <explanation */}
        <img
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          src="https://midday.ai/cdn-cgi/image/width=1000,quality=80,format=auto/https://cdn.midday.ai/video-poster-v2.jpg"
        />
      </div>

      {/* Video */}
      <video
        autoPlay
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
        loop
        muted
        playsInline
        poster="https://midday.ai/cdn-cgi/image/width=1000,quality=80,format=auto/https://cdn.midday.ai/video-poster-v2.jpg"
        preload="auto"
        ref={videoRef}
      >
        <source
          src="https://cdn.midday.ai/videos/login-video.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content overlay */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-2 text-center">
        <div className="max-w-lg">
          <LoginTestimonials />
        </div>
      </div>
    </div>
  );
}
