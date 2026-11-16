import { type FrameSettings, fitFrameSize } from "../../remotion/frame";
import { aspectRatios } from "./constants/aspect-ratios";

/** The size that takes the browser window's own shape, padded evenly on every side. */
export const FIT_WINDOW = "fit";

/**
 * The exported video's size in pixels, 1920 on the long edge: the window's
 * own shape for "Fit window", else the chosen ratio or custom size.
 */
export function videoFrameSize({
  selectedAspectRatio,
  customDimensions,
  frame,
  videoAspect,
}: {
  selectedAspectRatio: string;
  customDimensions: { width: number; height: number } | null;
  frame: FrameSettings;
  videoAspect: number;
}): { width: number; height: number } {
  if (selectedAspectRatio === FIT_WINDOW) {
    return fitFrameSize(videoAspect, frame);
  }
  const ratio = aspectRatios.find((r) => r.id === selectedAspectRatio);
  let shape = { width: 16, height: 9 };
  if (selectedAspectRatio === "custom" && customDimensions) {
    shape = customDimensions;
  } else if (ratio && ratio.width > 0 && ratio.height > 0) {
    shape = { width: ratio.width, height: ratio.height };
  }
  // Ratios are ratios: scale them to a real frame on the long edge rather
  // than rendering a 16x9 pixel video.
  const scale = 1920 / Math.max(shape.width, shape.height);
  return {
    width: Math.round(shape.width * scale),
    height: Math.round(shape.height * scale),
  };
}
