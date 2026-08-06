"use client";

import { Button } from "@castfy/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@castfy/ui/components/input-group";
import { cn } from "@castfy/ui/lib/utils";
import { Loading03Icon } from "hugeicons-react";
import { ArrowDownIcon, ClapperboardIcon } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";
import { getBackgroundCSS } from "@/lib/constants/backgrounds";
import { useEditorStore, useImageStore } from "@/lib/store";

const TRANSITION_DURATION = 400; // ms
type ColorScheme = "light" | "dark";

function extractImageUrl(style: React.CSSProperties): string | null {
  const bg = style.backgroundImage;
  if (!bg || typeof bg !== "string") {
    return null;
  }
  const match = bg.match(/url\(([^)]+)\)/);
  if (!match) {
    return null;
  }
  return match[1].replace(/['"]/g, "");
}

function preloadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
}

export function CleanUploadState() {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [screenshotUrl, setScreenshotUrl] = React.useState("");
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>("light");
  const [isCapturing, setIsCapturing] = React.useState(false);

  const { setScreenshot } = useEditorStore();
  const { addImages, setImage, backgroundConfig } = useImageStore();
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Crossfade state
  const backgroundStyle = React.useMemo(
    () => getBackgroundCSS(backgroundConfig),
    [backgroundConfig]
  );
  const [activeLayer, setActiveLayer] = React.useState<"a" | "b">("a");
  const [layerAStyle, setLayerAStyle] =
    React.useState<React.CSSProperties>(backgroundStyle);
  const [layerBStyle, setLayerBStyle] =
    React.useState<React.CSSProperties>(backgroundStyle);
  const [showTransition, setShowTransition] = React.useState(false);
  const prevConfigRef = React.useRef(backgroundConfig);
  const isFirstRender = React.useRef(true);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setLayerAStyle(backgroundStyle);
      setLayerBStyle(backgroundStyle);
      return;
    }

    const prev = prevConfigRef.current;
    const changed =
      prev.type !== backgroundConfig.type ||
      prev.value !== backgroundConfig.value;

    if (!changed) {
      if (activeLayer === "a") {
        setLayerAStyle(backgroundStyle);
      } else {
        setLayerBStyle(backgroundStyle);
      }
      return;
    }

    prevConfigRef.current = backgroundConfig;
    let cancelled = false;

    const applyNewBackground = (style: React.CSSProperties) => {
      if (cancelled) {
        return;
      }
      if (activeLayer === "a") {
        setLayerBStyle(style);
        setShowTransition(true);
        requestAnimationFrame(() => {
          if (!cancelled) {
            setActiveLayer("b");
          }
        });
      } else {
        setLayerAStyle(style);
        setShowTransition(true);
        requestAnimationFrame(() => {
          if (!cancelled) {
            setActiveLayer("a");
          }
        });
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(
        () => setShowTransition(false),
        TRANSITION_DURATION + 50
      );
    };

    if (backgroundConfig.type === "image") {
      const url = extractImageUrl(backgroundStyle);
      if (url) {
        preloadImage(url)
          .then((loadedUrl) => {
            applyNewBackground({
              ...backgroundStyle,
              backgroundImage: `url(${loadedUrl})`,
            });
          })
          .catch(() => applyNewBackground(backgroundStyle));
        return () => {
          cancelled = true;
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }
    }

    applyNewBackground(backgroundStyle);
    return () => {
      cancelled = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [backgroundConfig, backgroundStyle, activeLayer]);

  const validateFile = React.useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "File type not supported. Please use: PNG, JPG, WEBP";
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  }, []);

  const handleFile = React.useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      const imageUrl = URL.createObjectURL(file);
      setScreenshot({ src: imageUrl });
    },
    [validateFile, setScreenshot]
  );

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }
      addImages(acceptedFiles);
      handleFile(acceptedFiles[0]);
    },
    [addImages, handleFile]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive: dropzoneActive,
    open,
  } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: true,
    noClick: true,
    onDragEnter: () => {
      setIsDragActive(true);
      setError(null);
    },
    onDragLeave: () => setIsDragActive(false),
    onDropRejected: (rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e) => e.code === "file-too-large")) {
          setError(
            `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`
          );
        } else if (
          rejection.errors.some((e) => e.code === "file-invalid-type")
        ) {
          setError("File type not supported. Please use: PNG, JPG, WEBP");
        } else {
          setError("Failed to upload file. Please try again.");
        }
      }
    },
  });

  // Auto-focus the container so paste events work immediately
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent | ClipboardEvent) => {
      const clipboardData = "clipboardData" in e ? e.clipboardData : null;
      const items = clipboardData?.items;
      if (!items) {
        return;
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            addImages([file]);
            handleFile(file);
          }
          break;
        }
      }
    },
    [addImages, handleFile]
  );

  // Listen on both document and the container for paste events
  React.useEffect(() => {
    const handler = (e: ClipboardEvent) => handlePaste(e);
    document.addEventListener("paste", handler);
    return () => document.removeEventListener("paste", handler);
  }, [handlePaste]);

  const handleCaptureScreenshot = async () => {
    if (!screenshotUrl.trim()) {
      setError("Please enter a URL");
      return;
    }
    let finalUrl = screenshotUrl.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = `https://${finalUrl}`;
    }
    setIsCapturing(true);
    setError(null);
    try {
      const response = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalUrl,
          deviceType: "desktop",
          colorScheme,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to capture screenshot");
      }
      let base64Data = data.screenshot.trim();
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }
      base64Data = base64Data.replace(/\s/g, "");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/png" });
      const blobUrl = URL.createObjectURL(blob);
      const file = new File([blob], `screenshot-${colorScheme}.png`, {
        type: "image/png",
      });
      setScreenshot({ src: blobUrl });
      setImage(file);
      setScreenshotUrl("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to capture screenshot"
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const active = isDragActive || dropzoneActive;

  return (
    <div
      ref={containerRef}
      {...getRootProps()}
      className="relative flex h-full w-full items-center justify-center overflow-hidden outline-none"
      onPaste={handlePaste}
      tabIndex={0}
    >
      {/* Background Layer A */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...layerAStyle,
          transition: showTransition
            ? `opacity ${TRANSITION_DURATION}ms ease-in-out`
            : undefined,
          opacity: activeLayer === "a" ? (layerAStyle.opacity ?? 1) : 0,
          zIndex: 0,
        }}
      />
      {/* Background Layer B */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          ...layerBStyle,
          transition: showTransition
            ? `opacity ${TRANSITION_DURATION}ms ease-in-out`
            : undefined,
          opacity: activeLayer === "b" ? (layerBStyle.opacity ?? 1) : 0,
          zIndex: 0,
        }}
      />
      <input {...getInputProps()} />

      {/* Upload area with plus icon */}
      <div
        className={cn(
          "relative z-10 flex cursor-pointer flex-col items-center justify-center",
          "h-[80%] w-[80%] rounded-2xl",
          "bg-muted/20 backdrop-blur-sm",
          "border border-foreground/10",
          "transition-all duration-300 ease-out",
          "hover:border-foreground/15 hover:bg-foreground/8",
          active && "scale-[1.01] border-primary/30 bg-primary/10"
        )}
        onClick={open}
      >
        {/* Placeholder text */}
        <p className="mb-1 font-medium text-sm">
          {/* {active
            ? "Drop the image here..."
            : "Drag & drop, click to browse, or paste"} */}
          Generate video with our agent
        </p>

        {/* Screenshot URL input */}
        {!active && (
          <div
            className="mt-4 hidden w-full max-w-[280px] flex-col items-center gap-2 lg:flex"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full max-w-35 items-center gap-2">
              <div
                className="h-px flex-1"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
              <span
                className="text-[10px]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                or
              </span>
              <div
                className="h-px flex-1"
                style={{ background: "rgba(255,255,255,0.15)" }}
              />
            </div>
            <div className="flex w-full gap-1.5">
              <InputGroup className="border bg-background">
                <InputGroupInput
                  className="text-sm"
                  disabled={isCapturing}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleCaptureScreenshot()
                  }
                  placeholder="Enter video URL..."
                  type="url"
                  value={screenshotUrl}
                />
                <InputGroupAddon>
                  <ClapperboardIcon />
                </InputGroupAddon>
              </InputGroup>

              <Button
                disabled={isCapturing}
                onClick={handleCaptureScreenshot}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderColor: "rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {isCapturing ? (
                  <Loading03Icon className="animate-spin" size={14} />
                ) : (
                  <ArrowDownIcon size={14} />
                )}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-destructive/20 bg-background/90 px-3 py-1.5 text-destructive text-sm backdrop-blur-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
