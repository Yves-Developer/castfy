import { getVideoMetadata } from "@remotion/media-utils";
import type { CalculateMetadataFunction } from "remotion";

const TRIM_BEFORE = 60; // keep in sync with the Video's trimBefore
const FPS = 30;

export const calculateMetadata: CalculateMetadataFunction<{
  url: string;
}> = async ({ props }) => {
  const { durationInSeconds } = await getVideoMetadata(props.url);

  const fullDurationInFrames = Math.floor(durationInSeconds * FPS);

  return {
    durationInFrames: Math.max(1, fullDurationInFrames - TRIM_BEFORE),
    fps: FPS,
  };
};
