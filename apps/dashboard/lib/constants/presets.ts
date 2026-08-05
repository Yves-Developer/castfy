import type { ImageBorder, ImageShadow } from "@/lib/store";
import type { AspectRatioKey } from "./aspect-ratios";
import type { BackgroundConfig } from "./backgrounds";

export interface PresetConfig {
  aspectRatio: AspectRatioKey;
  backgroundBlur?: number;
  backgroundBorderRadius: number;
  backgroundConfig: BackgroundConfig;
  backgroundNoise?: number;
  borderRadius: number;
  description: string;
  id: string;
  imageBorder: ImageBorder;
  imageOpacity: number;
  imageScale: number;
  imageShadow: ImageShadow;
  name: string;
  perspective3D?: {
    perspective: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    translateX: number;
    translateY: number;
    scale: number;
  };
  shadowOverlay?: {
    src: string;
    opacity: number;
  };
}

export const presets: PresetConfig[] = [
  // 1. Spotlight - Dramatic dark with focused light
  {
    id: "spotlight",
    name: "Spotlight",
    description: "Dramatic dark with focused attention",
    aspectRatio: "16_9",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/raycast/mono_dark_distortion_2.webp",
      opacity: 1,
    },
    borderRadius: 8,
    backgroundBorderRadius: 0,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: "#1a1a1a",
      type: "arc-dark",
    },
    imageShadow: {
      enabled: true,
      blur: 40,
      offsetX: 10,
      offsetY: 10,
      spread: 20,
      color: "rgba(255, 255, 255, 0.08)",
      opacity: 0.5,
    },
    backgroundBlur: 4,
    backgroundNoise: 0,
  },

  // 8. Magazine Flatlay - Lying on textured surface with leaf shadows
  {
    id: "magazine-flatlay",
    name: "Magazine Flatlay",
    description: "Isometric flatlay with leaf shadows",
    aspectRatio: "16_9",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/paper/26.webp",
      opacity: 1,
    },
    borderRadius: 16,
    backgroundBorderRadius: 0,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 3,
      color: "#ffffff",
      type: "photograph",
    },
    imageShadow: {
      enabled: true,
      blur: 20,
      offsetX: 10,
      offsetY: 15,
      spread: 0,
      color: "rgba(0, 0, 0, 0.4)",
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 15,
    perspective3D: {
      perspective: 2400,
      rotateX: 45,
      rotateY: 0,
      rotateZ: -45,
      translateX: 0,
      translateY: -5,
      scale: 0.9,
    },
    shadowOverlay: {
      src: "/overlay-shadow/041.webp",
      opacity: 0.2,
    },
  },

  // 2. Lifted - Floating with hard shadow
  {
    id: "lifted",
    name: "Lifted",
    description: "Bold floating effect with hard shadow",
    aspectRatio: "1_1",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/raycast/loupe-mono-light.webp",
      opacity: 1,
    },
    borderRadius: 16,
    backgroundBorderRadius: 0,
    imageOpacity: 1,
    imageScale: 75,
    imageBorder: {
      enabled: false,
      width: 0,
      color: "#ffffff",
      type: "none",
    },
    imageShadow: {
      enabled: true,
      blur: 2,
      offsetX: 20,
      offsetY: 20,
      spread: 0,
      color: "rgba(0, 0, 0, 0)",
      opacity: 0,
    },
    backgroundBlur: 0,
    backgroundNoise: 0,
    shadowOverlay: {
      src: "/overlay-shadow/017.webp",
      opacity: 0.5,
    },
  },

  // 3. Neon Dreams - Vibrant with colored glow
  {
    id: "neon-dreams",
    name: "Neon Dreams",
    description: "Vibrant glow for creative content",
    aspectRatio: "16_9",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/raycast/chromatic_dark_2.webp",
      opacity: 1,
    },
    borderRadius: 16,
    backgroundBorderRadius: 20,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: "rgba(255,255,255,0.1)",
      type: "arc-dark",
    },
    imageShadow: {
      enabled: true,
      blur: 40,
      offsetX: 0,
      offsetY: 20,
      spread: 0,
      color: "#401d90",
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 0,
  },

  // 4. Editorial - Clean magazine style
  {
    id: "editorial",
    name: "Editorial",
    description: "Clean magazine-style presentation",
    aspectRatio: "4_5",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/paper/27.webp",
      opacity: 1,
    },
    borderRadius: 0,
    backgroundBorderRadius: 0,
    imageOpacity: 1,
    imageScale: 88,
    imageBorder: {
      enabled: true,
      width: 8,
      color: "#ffffff",
      type: "none",
    },
    imageShadow: {
      enabled: false,
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      spread: 0,
      color: "rgba(0, 0, 0, 0)",
      opacity: 0,
    },
    backgroundBlur: 0,
    backgroundNoise: 25,
    shadowOverlay: {
      src: "/overlay-shadow/019.webp",
      opacity: 0.5,
    },
  },

  // 9. Desktop View - Tilted on magic gradient
  {
    id: "desktop-view",
    name: "Desktop View",
    description: "Tilted view with magic gradient",
    aspectRatio: "16_9",
    backgroundConfig: {
      type: "gradient",
      value: "magic:magic_teal_dots",
      opacity: 1,
    },
    borderRadius: 8,
    backgroundBorderRadius: 0,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: "#2a2a2a",
      type: "arc-dark",
    },
    imageShadow: {
      enabled: true,
      blur: 20,
      offsetX: -15,
      offsetY: 25,
      spread: -10,
      color: "rgba(0, 0, 0, 0.5)",
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 0,
    perspective3D: {
      perspective: 2400,
      rotateX: 0,
      rotateY: 0,
      rotateZ: -8,
      translateX: 0,
      translateY: 0,
      scale: 0.95,
    },
  },

  // 5. Glass Card - Modern glassmorphism
  {
    id: "glass-card",
    name: "Glass Card",
    description: "Modern frosted glass effect",
    aspectRatio: "16_9",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/mesh/Peak.webp",
      opacity: 1,
    },
    borderRadius: 24,
    backgroundBorderRadius: 32,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: "rgba(255,255,255,0.2)",
      type: "arc-dark",
    },
    imageShadow: {
      enabled: true,
      blur: 40,
      offsetX: 0,
      offsetY: 30,
      spread: -15,
      color: "rgba(0, 0, 0, 0.3)",
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 30,
  },

  // 7. Sunset Fade - Warm gradient vibes
  {
    id: "sunset-fade",
    name: "Sunset Fade",
    description: "Warm tones for lifestyle content",
    aspectRatio: "og_image",
    backgroundConfig: {
      type: "image",
      value: "backgrounds/raycast/blushing-fire.webp",
      opacity: 1,
    },
    borderRadius: 20,
    backgroundBorderRadius: 24,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: "#ffffff",
      type: "arc-light",
    },
    imageShadow: {
      enabled: true,
      blur: 50,
      offsetX: 0,
      offsetY: 25,
      spread: -10,
      color: "rgba(0, 0, 0, 0.25)",
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 0,
  },
];

export const getPresetById = (id: string): PresetConfig | undefined =>
  presets.find((preset) => preset.id === id);
