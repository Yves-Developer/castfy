"use client";
import { useRef } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Pointer } from "../../../../../remotion/pointer";
import { trimBeforeFor } from "./meta";
import { cameraAt, cameraStyle, planShots, type ZoomTrack } from "../../../../../remotion/zoom";
import {
  type GradientKey,
  gradientColors,
} from "@/lib/constants/gradient-colors";
import {
  type MagicGradientKey,
  type MeshGradientKey,
  magicGradients,
  meshGradients,
} from "@/lib/constants/mesh-gradients";

interface BackgroundConfig {
  type: "solid" | "image" | "gradient";
  value: string;
}

interface ImageOverlay {
  flipX: boolean;
  flipY: boolean;
  id: string;
  isVisible: boolean;
  opacity: number;
  position: { x: number; y: number };
  rotation: number;
  size: number;
  src: string;
}

function resolveGradient(value: string): string {
  if (value.startsWith("magic:")) {
    const key = value.slice("magic:".length) as MagicGradientKey;
    return magicGradients[key] ?? "transparent";
  }
  if (value.startsWith("mesh:")) {
    const key = value.slice("mesh:".length) as MeshGradientKey;
    return meshGradients[key] ?? "transparent";
  }
  return gradientColors[value as GradientKey] ?? "transparent";
}
const REGX = /^backgrounds\//;
function resolveImageSrc(value: string): string {
  // Remote/browser-only sources pass through unchanged
  if (value.startsWith("blob:") || value.startsWith("http")) {
    return value;
  }
  // Strip the stray "backgrounds/" prefix stored in backgroundConfig.value
  const path = value.replace(REGX, "");
  return staticFile(path);
}

function Background({ config }: { config: BackgroundConfig }) {
  if (config.type === "image") {
    return (
      <Img
        onError={(e) =>
          console.error("Background image failed to load:", config.value, e)
        }
        src={resolveImageSrc(config.value)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }

  if (config.type === "gradient") {
    return (
      <AbsoluteFill style={{ background: resolveGradient(config.value) }} />
    );
  }

  // "solid" — covers hex/rgba colors and "transparent"
  return (
    <AbsoluteFill
      style={{
        background:
          config.value === "transparent" ? "transparent" : config.value,
      }}
    />
  );
}

function ShadowOverlay({ overlay }: { overlay: ImageOverlay }) {
  if (!overlay.isVisible) {
    return null;
  }

  return (
    <Img
      src={overlay.src}
      style={{
        position: "absolute",
        left: overlay.position.x,
        top: overlay.position.y,
        width: overlay.size,
        height: overlay.size,
        opacity: overlay.opacity,
        transform: `translate(-50%, -50%) rotate(${overlay.rotation}deg) scale(${
          overlay.flipX ? -1 : 1
        }, ${overlay.flipY ? -1 : 1})`,
        pointerEvents: "none",
      }}
    />
  );
}

/** Studio frames run at 30 fps, like the export. */
const FPS = 30;

export const StudioComposition = ({
  url,
  backgroundConfig,
  imageOverlays = [],
  zoom = null,
}: {
  url: string;
  backgroundConfig: BackgroundConfig;
  imageOverlays?: ImageOverlay[];
  zoom?: ZoomTrack | null;
}) => {
  const frame = useCurrentFrame();
  const trimBefore = trimBeforeFor(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  // While the video plays it is the clock: the timeline can lag it on a slow
  // Mac, and the zoom and pointer must stay on the picture. Once it has
  // ended, too: the lagging timeline would replay the last zoom and pointer
  // moves over its final frame.
  const video = videoRef.current;
  const onVideoClock = video && (!video.paused || video.ended);
  const ms = onVideoClock
    ? (video?.currentTime ?? 0) * 1000
    : ((frame + trimBefore) / FPS) * 1000;
  const camera = cameraStyle(cameraAt(ms, planShots(zoom)));
  return (
    <AbsoluteFill>
      {/* Background layer - bottom */}
      <AbsoluteFill>
        <Background config={backgroundConfig} />
      </AbsoluteFill>

      {/* Shadow / image overlays - between background and video */}
      {imageOverlays.map((overlay) => (
        <ShadowOverlay key={overlay.id} overlay={overlay} />
      ))}

      {/* Video layer - top */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "80%", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ ...camera, position: "relative" }}>
            {/*
              A plain video, not Remotion's: Remotion seeks its video back to
              the timeline whenever the two drift apart, which replayed the
              start of voiceover lines. This one keeps its own clock, and the
              zoom and pointer follow it (useVideoClock in player.tsx).
            */}
            {/* biome-ignore lint/a11y/useMediaCaption: the voiceover's captions are their own track */}
            <video
              data-preview-clock=""
              playsInline
              preload="auto"
              ref={videoRef}
              src={url}
              style={{ width: "100%", display: "block" }}
            />
            <Pointer ms={ms} track={zoom} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
