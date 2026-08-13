"use client";

import React from "react";
import { getBackgroundCSS } from "@/lib/constants/backgrounds";
import { useImageStore } from "@/lib/store";

const TRANSITION_DURATION = 400; // ms

function extractImageUrl(style: React.CSSProperties): string | null {
  const bg = style.backgroundImage;
  if (!bg || typeof bg !== "string") {
    return null;
  }
  // biome-ignore lint/performance/useTopLevelRegex: <explanation
  const match = bg.match(/url\(([^)]+)\)/);
  if (!match) {
    return null;
  }
  return match[1].replace(/['"]/g, "");
}

function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}

interface EditorVideoProps {
  onLoadedMetadata?: (duration: number) => void;
  onPause?: () => void;
  onPlay?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  onVolumeChange?: (volume: number) => void;
  url: string;
}

const EditorVideo = React.forwardRef<HTMLVideoElement, EditorVideoProps>(
  (
    { url, onLoadedMetadata, onTimeUpdate, onPlay, onPause, onVolumeChange },
    ref
  ) => {
    const { backgroundConfig } = useImageStore();
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Crossfade state
    const backgroundStyle = React.useMemo(
      () => getBackgroundCSS(backgroundConfig),
      [backgroundConfig]
    );
    const [activeLayer, setActiveLayer] = React.useState<"a" | "b">("a");
    const [layerAStyle, setLayerAStyle] =
      React.useState<React.CSSProperties>(backgroundStyle);
    const [layerBStyle, setLayerBStyle] =
      React.useState<React.CSSProperties>(backgroundStyle);
    const [showTransition, setShowTransition] = React.useState(false);
    const prevConfigRef = React.useRef(backgroundConfig);
    const isFirstRender = React.useRef(true);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

    React.useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        setLayerAStyle(backgroundStyle);
        setLayerBStyle(backgroundStyle);
        return;
      }

      const prev = prevConfigRef.current;
      const changed =
        prev.type !== backgroundConfig.type ||
        prev.value !== backgroundConfig.value;

      if (!changed) {
        if (activeLayer === "a") {
          setLayerAStyle(backgroundStyle);
        } else {
          setLayerBStyle(backgroundStyle);
        }
        return;
      }

      prevConfigRef.current = backgroundConfig;
      let cancelled = false;

      const applyNewBackground = (style: React.CSSProperties) => {
        if (cancelled) {
          return;
        }
        if (activeLayer === "a") {
          setLayerBStyle(style);
          setShowTransition(true);
          requestAnimationFrame(() => {
            if (!cancelled) {
              setActiveLayer("b");
            }
          });
        } else {
          setLayerAStyle(style);
          setShowTransition(true);
          requestAnimationFrame(() => {
            if (!cancelled) {
              setActiveLayer("a");
            }
          });
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(
          () => setShowTransition(false),
          TRANSITION_DURATION + 50
        );
      };

      if (backgroundConfig.type === "image") {
        const url = extractImageUrl(backgroundStyle);
        if (url) {
          preloadImage(url)
            .then((loadedUrl) => {
              applyNewBackground({
                ...backgroundStyle,
                backgroundImage: `url(${loadedUrl})`,
              });
            })
            .catch(() => applyNewBackground(backgroundStyle));
          return () => {
            cancelled = true;
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          };
        }
      }

      applyNewBackground(backgroundStyle);
      return () => {
        cancelled = true;
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [backgroundConfig, backgroundStyle, activeLayer]);

    // Auto-focus the container so paste events work immediately
    React.useEffect(() => {
      if (containerRef.current) {
        containerRef.current.focus();
      }
    }, []);

    return (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden outline-none">
        {/* Background Layer A */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...layerAStyle,
            transition: showTransition
              ? `opacity ${TRANSITION_DURATION}ms ease-in-out`
              : undefined,
            opacity: activeLayer === "a" ? (layerAStyle.opacity ?? 1) : 0,
            zIndex: 0,
          }}
        />
        {/* Background Layer B */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            ...layerBStyle,
            transition: showTransition
              ? `opacity ${TRANSITION_DURATION}ms ease-in-out`
              : undefined,
            opacity: activeLayer === "b" ? (layerBStyle.opacity ?? 1) : 0,
            zIndex: 0,
          }}
        />
        <div className="relative mx-auto h-[80%] w-[80%] max-w-160 overflow-hidden rounded-lg">
          {/** biome-ignore lint/a11y/useMediaCaption: <explanation */}
          <video
            controls={false}
            loop
            onLoadedMetadata={(event) => {
              const currentTarget = event.currentTarget;
              onLoadedMetadata?.(currentTarget.duration);
              onTimeUpdate?.(currentTarget.currentTime);
              onVolumeChange?.(currentTarget.volume);
            }}
            onPause={() => onPause?.()}
            onPlay={() => onPlay?.()}
            onTimeUpdate={(event) => {
              onTimeUpdate?.(event.currentTarget.currentTime);
            }}
            onVolumeChange={(event) => {
              onVolumeChange?.(event.currentTarget.volume);
            }}
            preload="metadata"
            ref={ref}
          >
            <source src={url} type="video/mp4" />
            <track
              kind="subtitles"
              label="English"
              src="/path/to/captions.vtt"
              srcLang="en"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  }
);

export { EditorVideo };
