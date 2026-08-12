"use client";
import { AbsoluteFill, Img, staticFile, Video } from "remotion";
import img from "@/public/asset-1.jpg";

export const StudioComposition = ({ url }: { url: string }) => {
  return (
    <AbsoluteFill>
      {/* Background layer - renders first, so it's at the bottom */}
      <AbsoluteFill>
        <Img
          src={staticFile(img.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* Your video layer - renders on top */}
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
