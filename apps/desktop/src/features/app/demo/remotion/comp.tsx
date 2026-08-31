"use client";
import { AbsoluteFill, Img, staticFile, Video } from "remotion";
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

export const StudioComposition = ({
  url,
  backgroundConfig,
  imageOverlays = [],
}: {
  url: string;
  backgroundConfig: BackgroundConfig;
  imageOverlays?: ImageOverlay[];
}) => {
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
        <Video
          src={url}
          style={{ width: "80%", borderRadius: 12 }}
          trimBefore={60}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
