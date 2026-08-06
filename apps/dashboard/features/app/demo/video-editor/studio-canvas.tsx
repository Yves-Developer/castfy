"use client";

import dynamic from "next/dynamic";
import React from "react";
import { CleanUploadState } from "@/components/controls/CleanUploadState";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useEditorStore, useImageStore } from "@/lib/store";

const ClientCanvas = dynamic(() => import("@/components/canvas/ClientCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
    </div>
  ),
});

export function StudioCanvas() {
  const { screenshot } = useEditorStore();
  const {
    slides,
    setActiveSlide,
    previewIndex,
    isPreviewing,
    stopPreview,
    uploadedImageUrl,
    selectedAspectRatio,
  } = useImageStore();

  // Check both stores - imageStore is the source of truth (tracked by undo/redo)
  const hasImage = !!uploadedImageUrl && !!screenshot.src;

  React.useEffect(() => {
    if (!isPreviewing) {
      return;
    }
    if (slides.length === 0) {
      stopPreview();
      return;
    }

    if (previewIndex >= slides.length) {
      stopPreview();
      return;
    }

    const slide = slides[previewIndex];
    setActiveSlide(slide.id);

    const timer = setTimeout(() => {
      useImageStore.setState((state) => {
        if (state.previewIndex + 1 >= state.slides.length) {
          return {
            isPreviewing: false,
            previewIndex: 0,
          };
        }

        return {
          previewIndex: state.previewIndex + 1,
        };
      });
    }, slide.duration * 1000);

    return () => clearTimeout(timer);
  }, [isPreviewing, previewIndex, setActiveSlide, slides, stopPreview]);

  // Show upload state if no image in either store
  if (!hasImage) {
    const currentRatio = aspectRatios.find(
      (ar) => ar.id === selectedAspectRatio
    );
    const ratioValue = currentRatio
      ? currentRatio.width / currentRatio.height
      : 16 / 9;

    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
        <div
          className="relative overflow-hidden rounded-lg border-2 transition-all duration-300"
          style={{
            aspectRatio: `${ratioValue}`,
            height: "100%",
            maxHeight: "70vh",
            //   width: `min(100%, min(48rem, calc(70vh * ${ratioValue})))`,
          }}
        >
          <CleanUploadState />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      {/* <ExportSlideshowDialog onOpenChange={setExportOpen} open={exportOpen} /> */}

      <div
        className="relative flex flex-1 items-center justify-center overflow-y-auto overflow-x-hidden"
        data-canvas-viewport
      >
        <ClientCanvas />
      </div>
    </div>
  );
}
