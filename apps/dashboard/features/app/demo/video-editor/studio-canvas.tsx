"use client";

import { CleanUploadState } from "@/components/controls/CleanUploadState";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useImageStore } from "@/lib/store";

export function StudioCanvas() {
  const { selectedAspectRatio } = useImageStore();

  const currentRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
  const ratioValue = currentRatio
    ? currentRatio.width / currentRatio.height
    : 16 / 9;

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-lg"
        style={{
          aspectRatio: `${ratioValue}`,
          height: "100%",
          maxHeight: "70vh",
        }}
      >
        <CleanUploadState />
      </div>
    </div>
  );
}
