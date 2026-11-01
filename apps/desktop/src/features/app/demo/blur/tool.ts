import { create } from "zustand";

/**
 * The blur tool's state while editing: not saved, unlike the boxes
 * themselves (the editor store's `blurs`).
 */
interface BlurTool {
  /** The next drag on the video draws a new box. */
  drawing: boolean;
  /** The studio plays the finished video, the one boxes are timed in. */
  onResult: boolean;
  /** The Blur panel is open: boxes get outlines and can be moved. */
  panelOpen: boolean;
  selectedId: string | null;
  set: (state: Partial<Omit<BlurTool, "set">>) => void;
}

export const useBlurTool = create<BlurTool>((set) => ({
  panelOpen: false,
  drawing: false,
  selectedId: null,
  onResult: true,
  set: (state) => set(state),
}));

/** The studio preview's video element, whose clock the boxes are timed on. */
export function previewVideo(): HTMLVideoElement | null {
  return document.querySelector<HTMLVideoElement>("video[data-preview-clock]");
}

/** Where the preview is, ms in the finished video. */
export function playheadMs(): number {
  const video = previewVideo();
  return video ? Math.round(video.currentTime * 1000) : 0;
}

/** How long the finished video is, ms; 0 before it has loaded. */
export function videoDurationMs(): number {
  const video = previewVideo();
  return video && Number.isFinite(video.duration)
    ? Math.round(video.duration * 1000)
    : 0;
}

export function formatMs(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = total - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}
