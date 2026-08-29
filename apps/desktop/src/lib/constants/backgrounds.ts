import { getR2ImageUrl } from "@/lib/r2";
import { backgroundPaths } from "@/lib/r2/r2-backgrounds";
import { type GradientKey, gradientColors } from "./gradient-colors";
import {
  type MagicGradientKey,
  type MeshGradientKey,
  magicGradients,
  meshGradients,
} from "./mesh-gradients";
import { type SolidColorKey, solidColors } from "./solid-colors";

export type BackgroundType = "gradient" | "solid" | "image";

export interface BackgroundConfig {
  opacity?: number;
  type: BackgroundType;
  value: GradientKey | SolidColorKey | string;
}

export const getBackgroundStyle = (config: BackgroundConfig): string => {
  const { type, value } = config;

  switch (type) {
    case "gradient": {
      if (typeof value === "string" && value.startsWith("mesh:")) {
        const meshKey = value.replace("mesh:", "") as MeshGradientKey;
        return meshGradients[meshKey] || gradientColors.vibrant_orange_pink;
      }
      if (typeof value === "string" && value.startsWith("magic:")) {
        const magicKey = value.replace("magic:", "") as MagicGradientKey;
        return magicGradients[magicKey] || gradientColors.vibrant_orange_pink;
      }
      return gradientColors[value as GradientKey];
    }

    case "solid": {
      if (value === "transparent") {
        return "transparent";
      }
      if (
        typeof value === "string" &&
        (value.startsWith("#") || value.startsWith("rgb"))
      ) {
        return value;
      }
      const color = solidColors[value as SolidColorKey];
      return color || "#ffffff";
    }

    case "image":
      return `url(${value})`;

    default:
      return gradientColors.vibrant_orange_pink;
  }
};

export const getBackgroundCSS = (
  config: BackgroundConfig
): React.CSSProperties => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case "gradient": {
      let gradient: string;

      if (typeof value === "string" && value.startsWith("mesh:")) {
        const meshKey = value.replace("mesh:", "") as MeshGradientKey;
        gradient = meshGradients[meshKey] || gradientColors.vibrant_orange_pink;
      } else if (typeof value === "string" && value.startsWith("magic:")) {
        const magicKey = value.replace("magic:", "") as MagicGradientKey;
        gradient =
          magicGradients[magicKey] || gradientColors.vibrant_orange_pink;
      } else {
        gradient =
          gradientColors[value as GradientKey] ||
          gradientColors.vibrant_orange_pink;
      }

      return {
        background: gradient,
        opacity,
      };
    }

    case "solid": {
      // Handle transparent background
      if (value === "transparent") {
        return {
          backgroundColor: "transparent",
          opacity: 1,
        };
      }
      // Handle direct color values (hex, rgb, rgba)
      if (
        typeof value === "string" &&
        (value.startsWith("#") || value.startsWith("rgb"))
      ) {
        return {
          backgroundColor: value,
          opacity,
        };
      }
      const color = solidColors[value as SolidColorKey] || "#ffffff";
      return {
        backgroundColor: color,
        opacity,
      };
    }

    case "image": {
      // Local assets (from /public) are served directly
      const isLocalPath = typeof value === "string" && value.startsWith("/");

      // Check if it's a known R2 background path
      const isR2Path =
        typeof value === "string" &&
        !isLocalPath &&
        !value.startsWith("blob:") &&
        !value.startsWith("http") &&
        !value.startsWith("data:") &&
        backgroundPaths.includes(value);

      // Get the image URL (R2 URL if it's a known path, otherwise use as-is)
      const imageUrl = isR2Path
        ? getR2ImageUrl({ src: value })
        : (value as string);

      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        opacity,
      };
    }

    default:
      return {
        background: gradientColors.vibrant_orange_pink,
        opacity,
      };
  }
};
