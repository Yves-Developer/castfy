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

/**
 * The part of the editor that belongs to a project rather than to the app.
 * Kept separate so it can be saved and restored as one value.
 */
export interface EditorState {
  backgroundConfig: BackgroundConfig;
  customDimensions: { width: number; height: number } | null;
  imageOverlays: ImageOverlay[];
  selectedAspectRatio: AspectRatioKey;
}

export interface BackgroundState extends EditorState {
  /** Replaces the whole look at once, when a project is opened. */
  loadEditorState: (state: EditorState | null) => void;

  addImageOverlay: (overlay: Omit<ImageOverlay, "id">) => void;
  /** Not part of EditorState: it belongs to the recording, not the look. */
  generatedVideoUrl: string | null;
  removeImageOverlay: (id: string) => void;
  setAspectRatio: (aspectRatio: AspectRatioKey) => void;

  // Background methods
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundValue: (value: string) => void;
  setCustomDimensions: (width: number, height: number) => void;
  setGeneratedVideoUrl: (url: string | null) => void; // Setter for generated video URL
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
}

/** The look a project starts with, and what it resets to. */
export const DEFAULT_EDITOR: EditorState = {
  backgroundConfig: {
    type: "image",
    value: "backgrounds/raycast/red_distortion_4.webp",
    opacity: 1,
  },
  imageOverlays: [],
  selectedAspectRatio: "16:9",
  customDimensions: null,
};

export const useBackgroundStore = create<BackgroundState>()(
  temporal((set) => ({
    backgroundConfig: DEFAULT_EDITOR.backgroundConfig,
    imageOverlays: DEFAULT_EDITOR.imageOverlays,
    selectedAspectRatio: DEFAULT_EDITOR.selectedAspectRatio,
    customDimensions: DEFAULT_EDITOR.customDimensions,

    /**
     * Opening a project must replace the look wholesale, including clearing
     * what the previous project had. Merging would leak its overlays into a
     * project that never had any.
     */
    loadEditorState: (state: EditorState | null) => {
      set({ ...DEFAULT_EDITOR, ...(state ?? {}) });
    },

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
