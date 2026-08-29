/** biome-ignore-all lint/performance/noImgElement: <explanation */
/** biome-ignore-all lint/correctness/useImageSize: <explanation */
"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@castfy/ui/components/accordion";

import { cn } from "@castfy/ui/lib/utils";
import { ImageIcon, XIcon } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { CachedImage } from "@/components/ui/cached-image";
import { ColorPicker } from "@/components/ui/color-picker";
import { useResponsiveCanvasDimensions } from "@/hooks/use-aspect-ratio-dimensions";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import {
  type GradientKey,
  gradientColors,
} from "@/lib/constants/gradient-colors";
import {
  type MagicGradientKey,
  type MeshGradientKey,
  magicGradients,
  meshGradients,
} from "@/lib/constants/mesh-gradients";
import {
  backgroundCategories,
  getBackgroundThumbnailUrl,
} from "@/lib/r2/r2-backgrounds";
import { useBackgroundStore } from "@/lib/store";

// Shadow overlay IDs
const OVERLAY_SHADOW_IDS = [
  "023",
  "001",
  "002",
  "007",
  "017",
  "019",
  "031",
  "037",
  "041",
  "050",
  "053",
  "057",
  "063",
  "064",
  "082",
  "083",
  "088",
  "097",
  "099",
];
const OVERLAY_SHADOW_URLS = OVERLAY_SHADOW_IDS.map(
  (id) => `/overlay-shadow/${id}.webp`
);

// Category display names (ordered)
const CATEGORY_ORDER = [
  "assets",
  "mac",
  "radiant",
  "mesh",
  "raycast",
  "paper",
  "pattern",
] as const;
const CATEGORY_LABELS: Record<string, string> = {
  assets: "Abstract",
  mac: "macOS",
  radiant: "Radiant",
  mesh: "Mesh",
  raycast: "Raycast",
  paper: "Paper",
  pattern: "Pattern",
};

export function BackgroundTab() {
  const {
    backgroundConfig,
    imageOverlays,
    setBackgroundType,
    setBackgroundValue,
    addImageOverlay,
    removeImageOverlay,
  } = useBackgroundStore();

  const responsiveDimensions = useResponsiveCanvasDimensions();
  const [bgUploadError, setBgUploadError] = React.useState<string | null>(null);
  const [customColor, setCustomColor] = React.useState("#7dd4ad");

  // Track which custom bg option is active
  const customBgType = React.useMemo(() => {
    if (
      backgroundConfig.type === "solid" &&
      backgroundConfig.value === "transparent"
    ) {
      return "transparent";
    }
    if (
      backgroundConfig.type === "solid" &&
      backgroundConfig.value?.startsWith("#")
    ) {
      return "color";
    }
    if (
      backgroundConfig.type === "solid" &&
      backgroundConfig.value?.startsWith("rgba")
    ) {
      return "color";
    }
    if (
      backgroundConfig.type === "image" &&
      backgroundConfig.value?.startsWith("blob:")
    ) {
      return "image";
    }
    return null;
  }, [backgroundConfig]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "File type not supported. Please use: PNG, JPG, WEBP";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation
  const onBgDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationError = validateFile(file);
        if (validationError) {
          setBgUploadError(validationError);
          return;
        }
        setBgUploadError(null);
        const blobUrl = URL.createObjectURL(file);
        setBackgroundValue(blobUrl);
        setBackgroundType("image");
      }
    },
    [setBackgroundValue, setBackgroundType]
  );

  const { getRootProps: getBgRootProps, getInputProps: getBgInputProps } =
    useDropzone({
      onDrop: onBgDrop,
      accept: {
        // react-dropzone requires a leading dot. Without it the whole entry is
        // rejected as an "invalid file extension" and the filter silently does
        // nothing, so the picker accepts any file at all.
        "image/*": ALLOWED_IMAGE_TYPES.map((type) => `.${type.split("/")[1]}`),
      },
      maxSize: MAX_IMAGE_SIZE,
      multiple: false,
    });

  // Overlay helpers
  const getFullCanvasOverlay = () => {
    const canvasWidth = responsiveDimensions.width || 1920;
    const canvasHeight = responsiveDimensions.height || 1080;
    return {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      size: Math.max(canvasWidth, canvasHeight),
    };
  };

  const handleAddShadow = (shadowUrl: string) => {
    // Remove any existing shadows first (only one shadow at a time)
    for (const overlay of imageOverlays) {
      if (
        typeof overlay.src === "string" &&
        overlay.src.includes("overlay-shadow")
      ) {
        removeImageOverlay(overlay.id);
      }
    }

    // Add the new shadow
    const { x, y, size } = getFullCanvasOverlay();
    addImageOverlay({
      src: shadowUrl,
      position: { x, y },
      size,
      rotation: 0,
      opacity: 0.5,
      flipX: false,
      flipY: false,
      isVisible: true,
    });
  };

  const handleRemoveShadows = () => {
    for (const overlay of imageOverlays) {
      if (
        typeof overlay.src === "string" &&
        overlay.src.includes("overlay-shadow")
      ) {
        removeImageOverlay(overlay.id);
      }
    }
  };

  // Get current active shadow
  const currentShadow = imageOverlays.find(
    (overlay) =>
      typeof overlay.src === "string" && overlay.src.includes("overlay-shadow")
  );

  const availableCategories = CATEGORY_ORDER.filter(
    (cat) => backgroundCategories[cat]?.length > 0
  );

  return (
    <div className="flex h-full flex-col">
      <Accordion collapsible defaultValue="light-shadow" type="single">
        <AccordionItem value="light-shadow">
          <AccordionTrigger className="text-foreground hover:no-underline data-[state=closed]:text-muted-foreground">
            Light Shadow
          </AccordionTrigger>
          <AccordionContent className="h-full">
            <div className="grid grid-cols-3 gap-2 p-1">
              <button
                className={cn(
                  "flex aspect-video items-center justify-center rounded-xl border font-medium text-xs transition-all",
                  currentShadow
                    ? "border-border/50 border-dashed text-muted-foreground hover:border-border hover:bg-card/30"
                    : "border-primary/50 bg-primary/5 text-foreground"
                )}
                onClick={handleRemoveShadows}
                type="button"
              >
                None
              </button>
              {OVERLAY_SHADOW_URLS.slice(0, 11).map((shadowUrl, index) => (
                <button
                  className={cn(
                    "aspect-video overflow-hidden rounded-xl border bg-secondary transition-all dark:bg-secondary",
                    currentShadow?.src === shadowUrl
                      ? "border-primary/50 ring-1 ring-primary/30"
                      : "border-border/30 hover:border-border/60"
                  )}
                  key={index}
                  onClick={() => handleAddShadow(shadowUrl)}
                  type="button"
                >
                  <img
                    alt={`Shadow ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    src={shadowUrl}
                  />
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="custom-background">
          <AccordionTrigger className="text-foreground hover:no-underline data-[state=closed]:text-muted-foreground">
            Custom Background
          </AccordionTrigger>
          <AccordionContent className="h-full">
            <div className="grid grid-cols-3 gap-2 p-1">
              {/* Image Upload */}
              <div
                {...getBgRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 transition-all",
                  customBgType === "image"
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/40 bg-muted/30 hover:border-border/60 hover:bg-accent"
                )}
              >
                <input {...getBgInputProps()} />
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    customBgType === "image" ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <ImageIcon
                    className={
                      customBgType === "image"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }
                    size={14}
                  />
                </div>
                <span
                  className={cn(
                    "font-medium text-[10px]",
                    customBgType === "image"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Image
                </span>
              </div>

              {/* Color Picker */}
              <ColorPicker
                className={cn(
                  "flex h-auto flex-col items-center justify-center gap-1.5 rounded-xl py-2.5",
                  customBgType === "color"
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/40 bg-muted/30 hover:border-border/60 hover:bg-accent"
                )}
                color={customColor}
                onChange={(newColor) => {
                  setCustomColor(newColor);
                  setBackgroundType("solid");
                  setBackgroundValue(newColor);
                }}
              />

              {/* Transparent */}
              <button
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 rounded-xl border py-2.5 transition-all",
                  customBgType === "transparent"
                    ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/40 bg-muted/30 hover:border-border/60 hover:bg-accent"
                )}
                onClick={() => {
                  setBackgroundType("solid");
                  setBackgroundValue("transparent");
                }}
                type="button"
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    customBgType === "transparent"
                      ? "bg-primary/10"
                      : "bg-muted"
                  )}
                >
                  <div
                    className="h-3.5 w-3.5 rounded-full border border-border/50"
                    style={{
                      background:
                        "repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 6px 6px",
                    }}
                  />
                </div>
                <span
                  className={cn(
                    "font-medium text-[10px]",
                    customBgType === "transparent"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  Transparent
                </span>
              </button>
            </div>
            {bgUploadError && (
              <p className="mt-2 text-destructive text-xs">{bgUploadError}</p>
            )}

            {/* Current Image Preview */}
            {backgroundConfig.type === "image" &&
              backgroundConfig.value?.startsWith("blob:") && (
                <div className="relative mt-3 aspect-video overflow-hidden rounded-lg border border-border/40 bg-muted/50">
                  <img
                    alt="Background"
                    className="h-full w-full object-cover"
                    src={backgroundConfig.value}
                  />
                  <button
                    className="absolute top-2 right-2 rounded-md bg-background/50 p-1 text-foreground transition-colors hover:bg-destructive"
                    onClick={() => {
                      setBackgroundType("gradient");
                      setBackgroundValue("vibrant_orange_pink");
                      URL.revokeObjectURL(backgroundConfig.value);
                    }}
                    type="button"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              )}
          </AccordionContent>
        </AccordionItem>

        {availableCategories.map((category) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-foreground hover:no-underline data-[state=closed]:text-muted-foreground">
              {CATEGORY_LABELS[category] || category}
            </AccordionTrigger>
            <AccordionContent className="h-full">
              <div className="grid grid-cols-4 gap-2 p-1">
                {(backgroundCategories[category] || []).map(
                  (imagePath: string, idx: number) => (
                    <button
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:scale-105",
                        backgroundConfig.value === imagePath
                          ? "border-primary ring-1 ring-primary/30"
                          : "border-transparent hover:border-border/50"
                      )}
                      key={`${category}-${idx}`}
                      onClick={() => {
                        setBackgroundValue(imagePath);
                        setBackgroundType("image");
                      }}
                      type="button"
                    >
                      <CachedImage
                        alt={`${category} ${idx + 1}`}
                        className="h-full w-full object-cover"
                        src={getBackgroundThumbnailUrl(imagePath)}
                      />
                    </button>
                  )
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="magic-gradients">
          <AccordionTrigger className="text-foreground hover:no-underline data-[state=closed]:text-muted-foreground">
            Magic Gradients
          </AccordionTrigger>
          <AccordionContent className="h-fit p-1">
            <div className="scrollbar-hide overflow-x-auto">
              <div className="mb-10 grid grid-cols-6 gap-2">
                {(Object.keys(magicGradients) as MagicGradientKey[]).map(
                  (key) => (
                    <button
                      className={cn(
                        "block h-8 w-8 shrink-0 cursor-pointer border border-border/20 transition-all duration-200 hover:scale-105",
                        backgroundConfig.value === `magic:${key}`
                          ? "scale-110 rounded-full"
                          : "rounded-lg"
                      )}
                      key={`magic-${key}`}
                      onClick={() => {
                        setBackgroundType("gradient");
                        setBackgroundValue(`magic:${key}`);
                      }}
                      style={{
                        background: magicGradients[key],
                      }}
                      type="button"
                    />
                  )
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="gradients">
          <AccordionTrigger className="text-foreground hover:no-underline data-[state=closed]:text-muted-foreground">
            Gradients
          </AccordionTrigger>
          <AccordionContent className="h-fit p-1">
            <div className="mb-20 grid grid-cols-6 gap-2">
              {/* Classic Gradients */}
              {(Object.keys(gradientColors) as GradientKey[]).map((key) => (
                <button
                  className={cn(
                    "block size-8 shrink-0 cursor-pointer border border-border/20 transition-all duration-200 hover:scale-105",
                    backgroundConfig.value === key
                      ? "scale-110 rounded-full"
                      : "rounded-lg"
                  )}
                  key={`classic-${key}`}
                  onClick={() => {
                    setBackgroundType("gradient");
                    setBackgroundValue(key);
                  }}
                  style={{
                    background: gradientColors[key],
                  }}
                  type="button"
                />
              ))}

              {/* Mesh Gradients */}
              {(Object.keys(meshGradients) as MeshGradientKey[]).map((key) => (
                <button
                  className={cn(
                    "block size-8 shrink-0 cursor-pointer border border-border/20 transition-all duration-200 hover:scale-105",
                    backgroundConfig.value === `mesh:${key}`
                      ? "scale-110 rounded-full"
                      : "rounded-lg"
                  )}
                  key={`mesh-${key}`}
                  onClick={() => {
                    setBackgroundType("gradient");
                    setBackgroundValue(`mesh:${key}`);
                  }}
                  style={{
                    background: meshGradients[key],
                  }}
                  type="button"
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
