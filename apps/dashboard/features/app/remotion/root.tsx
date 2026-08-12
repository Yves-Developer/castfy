"use client";
import { Composition } from "remotion";
import { demoVideoUrl } from "@/config/data";
import { StudioComposition } from "./comp";
import { calculateMetadata } from "./meta";

export function RemotionRoot() {
  return (
    <Composition
      calculateMetadata={calculateMetadata}
      component={StudioComposition}
      defaultProps={{
        url: demoVideoUrl,
      }}
      durationInFrames={60}
      fps={30}
      height={720}
      id="StudioComposition"
      width={1280}
    />
  );
}
