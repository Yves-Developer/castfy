import { getVideoMetadata } from "@remotion/media-utils";
import type { CalculateMetadataFunction } from "remotion";

const FPS = 30;

/**
 * Frames the studio skips at the start of a recording. Older recordings open
 * on a couple of seconds of blank page; the segment recorder's demo.mp4 starts
 * on the opening shot. The composition and its duration both use this, or the
 * preview loses the end of the video.
 */
export function trimBeforeFor(url: string): number {
  return url.includes("demo.mp4") ? 0 : 60;
}

export const calculateMetadata: CalculateMetadataFunction<{
  url: string;
}> = async ({ props }) => {
  const { durationInSeconds } = await getVideoMetadata(props.url);

  const fullDurationInFrames = Math.floor(durationInSeconds * FPS);

  return {
    durationInFrames: Math.max(1, fullDurationInFrames - trimBeforeFor(props.url)),
    fps: FPS,
  };
};
