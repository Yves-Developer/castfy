"use client";
import { PlayIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import lightCover from "@/public/images/dashboard-light.svg";
export default function HeroVid() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPosterLoaded, setIsPosterLoaded] = useState(false);
  const [isDashboardLightLoaded, setIsDashboardLightLoaded] = useState(false);
  const [isDashboardDarkLoaded, setIsDashboardDarkLoaded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState("overview");
  const [videoProgress, setVideoProgress] = useState(0);

  const videoContainerRef = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);
  const styleSheetRef = useRef<HTMLStyleElement | null>(null);

  // Handle video load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoad = () => setIsVideoLoaded(true);

    if (video.readyState >= 3) {
      setIsVideoLoaded(true);
    }

    video.addEventListener("canplay", handleLoad);
    video.addEventListener("loadeddata", handleLoad);

    return () => {
      video.removeEventListener("canplay", handleLoad);
      video.removeEventListener("loadeddata", handleLoad);
    };
  }, []);

  // Handle modal video switching
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video || !isVideoModalOpen) return;

    const activeVideo = videos.find((v) => v.id === activeVideoId);
    if (activeVideo) {
      if (video.src !== activeVideo.url) {
        video.src = activeVideo.url;
        video.load();
        setVideoProgress(0);
      }
      // Try to play when video is ready
      const handleCanPlay = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay may fail, user can click play
          });
        }
      };
      video.addEventListener("canplay", handleCanPlay);
      // If already loaded, play immediately
      if (video.readyState >= 3) {
        handleCanPlay();
      }
      return () => {
        video.removeEventListener("canplay", handleCanPlay);
      };
    }
  }, [activeVideoId, isVideoModalOpen]);

  // Track video progress
  useEffect(() => {
    const video = modalVideoRef.current;
    if (!video || !isVideoModalOpen) return;

    const updateProgress = () => {
      if (video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        setVideoProgress(progress);
      }
    };

    const handleTimeUpdate = () => updateProgress();
    const handleLoadedMetadata = () => {
      setVideoProgress(0);
      updateProgress();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [activeVideoId, isVideoModalOpen]);

  // Inject video modal styles
  useEffect(() => {
    if (!isVideoModalOpen) return;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      video::-webkit-media-controls-timeline,
      video::-webkit-media-controls-current-time-display,
      video::-webkit-media-controls-time-remaining-display,
      video::-webkit-media-controls-timeline-container,
      video::-webkit-media-controls-panel {
        display: none !important;
      }
      video {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
      }
    `;
    document.head.appendChild(style);
    styleSheetRef.current = style;

    return () => {
      if (styleSheetRef.current) {
        document.head.removeChild(styleSheetRef.current);
        styleSheetRef.current = null;
      }
    };
  }, [isVideoModalOpen]);
  return (
    <div
      className="mt-8 mb-8 md:mt-12 lg:mt-0 lg:mb-4 3xl:mb-20 overflow-visible lg:w-full"
      ref={videoContainerRef}
    >
      <div className="relative overflow-hidden">
        {/* Poster image with fade and blur effect */}
        <div
          className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out z-[1] ${
            isVideoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          style={{
            filter: isVideoLoaded ? "blur(0px)" : "blur(1px)",
          }}
        >
          <Image
            src="https://cdn.midday.ai/video-poster-v2.jpg"
            alt="Midday dashboard preview"
            fill
            fetchPriority="high"
            quality={50}
            sizes="100vw"
            className="object-cover transition-all duration-1000 ease-in-out"
            style={{
              filter: isPosterLoaded ? "blur(0px)" : "blur(12px)",
              transform: isPosterLoaded ? "scale(1)" : "scale(1.05)",
            }}
            priority
            onLoad={() => setIsPosterLoaded(true)}
          />
        </div>

        <video
          ref={videoRef}
          className={`w-full h-[420px] sm:h-[520px] md:h-[600px] lg:h-[800px] xl:h-[900px] 3xl:h-[1000px] object-cover transition-opacity duration-1000 ease-in-out ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
        >
          <source
            src="https://cdn.midday.ai/videos/login-video.mp4"
            type="video/mp4"
          />
        </video>

        {/* Dashboard overlay - different styles for mobile vs desktop */}
        <div className="absolute inset-0 flex items-center justify-center p-0 lg:p-4 z-[2]">
          <div className="relative lg:static scale-[0.95] md:scale-100 lg:scale-100 lg:h-full lg:flex lg:flex-col lg:items-center lg:justify-center">
            <Image
              src={lightCover}
              alt="Dashboard illustration"
              width={1600}
              height={1200}
              className="w-full h-auto md:!scale-[0.85] lg:!scale-100 lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] block dark:hidden lg:[transform:rotate(-2deg)_skewY(1deg)] lg:[filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
              style={{
                filter: isDashboardLightLoaded
                  ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                  : "blur(20px)",
                transform: isDashboardLightLoaded ? "scale(1)" : "scale(1.02)",
              }}
              priority
              fetchPriority="high"
              onLoad={() => setIsDashboardLightLoaded(true)}
            />

            <Image
              src="/images/dashboard-dark.svg"
              alt="Dashboard illustration"
              width={1600}
              height={1200}
              className="w-full h-auto md:!scale-[0.85] lg:!scale-100 lg:object-contain lg:max-w-[85%] 2xl:max-w-[75%] hidden dark:block lg:[transform:rotate(-2deg)_skewY(1deg)] lg:[filter:drop-shadow(0_30px_60px_rgba(0,0,0,0.6))] transition-all duration-700 ease-out"
              style={{
                filter: isDashboardDarkLoaded
                  ? "blur(0px) drop-shadow(0 30px 60px rgba(0,0,0,0.6))"
                  : "blur(20px)",
                transform: isDashboardDarkLoaded ? "scale(1)" : "scale(1.02)",
              }}
              priority
              fetchPriority="high"
              onLoad={() => setIsDashboardDarkLoaded(true)}
            />
          </div>
        </div>

        {/* Play Button Overlay */}
        <button
          type="button"
          onClick={() => {
            setIsVideoModalOpen(true);
            setActiveVideoId("overview");
          }}
          className={`hidden absolute inset-0 z-[4] flex items-center justify-center pointer-events-none transition-opacity duration-500 delay-300 ${
            isDashboardLightLoaded || isDashboardDarkLoaded
              ? "opacity-100"
              : "opacity-0"
          }`}
          aria-label="Play video"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-muted hover:bg-secondary hover:scale-105 flex items-center justify-center transition-all duration-200 pointer-events-auto">
            <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
          </div>
        </button>
      </div>
    </div>
  );
}
