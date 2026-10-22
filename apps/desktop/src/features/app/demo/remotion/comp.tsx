"use client";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, Video } from "remotion";
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

/** How far the preview video may drift from the timeline before it is re-synced. */
const PREVIEW_DRIFT_S = 1.5;

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
  const ms = ((frame + trimBefore) / FPS) * 1000;
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
              The preview keeps this video in step with its timeline by
              seeking it when they drift apart, which replays the last words
              of a voiceover. On a slow Mac they drift often: wait for the
              video instead, and only seek on a large drift.
            */}
            <Video
              acceptableTimeShiftInSeconds={PREVIEW_DRIFT_S}
              pauseWhenBuffering
              src={url}
              style={{ width: "100%", display: "block" }}
              trimBefore={trimBefore}
            />
            <Pointer ms={ms} track={zoom} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
