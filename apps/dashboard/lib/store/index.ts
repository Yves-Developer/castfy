"use client";

import { temporal } from "zundo";
import { create } from "zustand";
import type {
  BackgroundConfig,
  BackgroundType,
} from "@/lib/constants/backgrounds";
import type { AspectRatioKey } from "../constants/aspect-ratios";

export interface ImageOverlay {
  blur?: number; // Blur amount in pixels (0 = no blur)
  flipX: boolean;
  flipY: boolean;
  id: string;
  isCustom?: boolean; // Whether it's a custom uploaded overlay
  isVisible: boolean;
  layer?: "front" | "back"; // Render in front of or behind the main image
  opacity: number;
  position: { x: number; y: number }; // Position in pixels relative to canvas
  rotation: number; // Rotation in degrees
  size: number; // Size in pixels
  src: string;
}

export interface BackgroundState {
  addImageOverlay: (overlay: Omit<ImageOverlay, "id">) => void;
  // Background state
  backgroundConfig: BackgroundConfig;
  customDimensions: { width: number; height: number } | null;
  generatedVideoUrl: string | null; // URL of the generated video, if any
  imageOverlays: ImageOverlay[];
  removeImageOverlay: (id: string) => void;
  selectedAspectRatio: AspectRatioKey;
  setAspectRatio: (aspectRatio: AspectRatioKey) => void;

  // Background methods
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundValue: (value: string) => void;
  setCustomDimensions: (width: number, height: number) => void;
  setGeneratedVideoUrl: (url: string | null) => void; // Setter for generated video URL
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
}

export const useBackgroundStore = create<BackgroundState>()(
  temporal((set) => ({
    generatedVideoUrl: null,
    setGeneratedVideoUrl: (url: string | null) => {
      set({ generatedVideoUrl: url });
    },
    setAspectRatio: (aspectRatio: AspectRatioKey) => {
      //   trackAspectRatioChange(aspectRatio);
      set({ selectedAspectRatio: aspectRatio });
    },

    setCustomDimensions: (width: number, height: number) => {
      //   trackAspectRatioChange("custom");
      set({
        selectedAspectRatio: "custom",
        customDimensions: { width, height },
      });
    },
    selectedAspectRatio: "16:9",
    customDimensions: null,
    // Initial state
    backgroundConfig: {
      type: "image",
      value: "backgrounds/raycast/red_distortion_4.webp",
      opacity: 1,
    },
    imageOverlays: [],

    // Background type setter
    setBackgroundType: (type: BackgroundType) => {
      set((state) => ({
        backgroundConfig: {
          ...state.backgroundConfig,
          type,
        },
      }));
    },

    // Background value setter
    setBackgroundValue: (value: string) => {
      set((state) => ({
        backgroundConfig: {
          ...state.backgroundConfig,
          value,
        },
      }));
    },

    // Add image overlay
    addImageOverlay: (overlay) => {
      const id = `overlay-${Date.now()}-${Math.random()
        .toString(36)
        // biome-ignore lint/style/noSubstr: <explanation
        .substr(2, 9)}`;
      set((state) => ({
        imageOverlays: [...state.imageOverlays, { blur: 0, ...overlay, id }],
      }));
    },

    // Update image overlay
    updateImageOverlay: (id, updates) => {
      set((state) => ({
        imageOverlays: state.imageOverlays.map((overlay) =>
          overlay.id === id ? { ...overlay, ...updates } : overlay
        ),
      }));
    },

    // Remove image overlay
    removeImageOverlay: (id) => {
      set((state) => ({
        imageOverlays: state.imageOverlays.filter(
          (overlay) => overlay.id !== id
        ),
      }));
    },
  }))
);
