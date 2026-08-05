"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MockupRenderer } from "@/components/mockups/MockupRenderer";
import { useResponsiveCanvasDimensions } from "@/hooks/use-aspect-ratio-dimensions";
import { generateNoiseTexture } from "@/lib/export/export-utils";
import { generatePattern } from "@/lib/patterns";
import { useEditorStore, useImageStore } from "@/lib/store";
import { CanvasRulers } from "./CanvasRulers";
import { useBackgroundImage, useOverlayImages } from "./hooks/useImageLoading";
import {
  HTMLBackgroundLayer,
  HTMLBlurRegionLayer,
  HTMLCanvasRenderer,
  HTMLGridLayer,
  HTMLImageOverlayLayer,
  HTMLMainImageLayer,
  HTMLNoiseLayer,
  HTMLPatternLayer,
  HTMLTextOverlayLayer,
  SnapAlignmentGuides,
  SVGAnnotationLayer,
} from "./html";
import { Perspective3DOverlay } from "./overlays/Perspective3DOverlay";
import { calculateCanvasDimensions } from "./utils/canvas-dimensions";

// Reference to the HTML canvas container for export
let globalCanvasContainer: HTMLDivElement | null = null;

function CanvasRenderer({ image }: { image: HTMLImageElement }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const {
    screenshot,
    setScreenshot,
    shadow,
    pattern: patternStyle,
    frame: editorFrame,
    canvas,
    noise,
  } = useEditorStore();

  const {
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    perspective3D,
    imageOpacity,
    imageFilters,
    textOverlays,
    imageOverlays,
    mockups,
    imageBorder,
    updateTextOverlay,
    updateImageOverlay,
    removeImageOverlay,
    addImageOverlay,
    // Annotations
    annotations,
    activeAnnotationTool,
    selectedAnnotationId,
    setSelectedAnnotationId,
    annotationDefaults,
    addAnnotation,
    updateAnnotation: updateAnnotationShape,
    removeAnnotation,
    setActiveAnnotationTool,
    // Blur
    blurRegions,
    addBlurRegion,
    updateBlurRegion,
    removeBlurRegion,
    browserHeaderSize,
    showRulers,
    showGrid,
    rulerInterval,
  } = useImageStore();

  // Split overlays into front (default) and back (behind main image)
  const backOverlays = imageOverlays.filter((o) => o.layer === "back");
  const frontOverlays = imageOverlays.filter((o) => o.layer !== "back");

  // Build frame from imageBorder directly (editorStore sync may be stale)
  const frame = {
    ...editorFrame,
    enabled: imageBorder.enabled,
    type: imageBorder.type,
    width: imageBorder.width,
    color: imageBorder.color,
    padding: imageBorder.padding,
    title: imageBorder.title,
    opacity: imageBorder.opacity,
  };

  const hasMockups = mockups.length > 0 && mockups.some((m) => m.isVisible);
  const responsiveDimensions = useResponsiveCanvasDimensions();

  const [viewportSize, setViewportSize] = useState({
    width: 1920,
    height: 1080,
  });

  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(
    null
  );
  const [noiseImage, setNoiseImage] = useState<HTMLImageElement | null>(null);
  const [noiseTexture, setNoiseTexture] = useState<HTMLCanvasElement | null>(
    null
  );

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isMainImageSelected, setIsMainImageSelected] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDraggingMainImage, setIsDraggingMainImage] = useState(false);
  const [selectedBlurId, setSelectedBlurId] = useState<string | null>(null);

  // 3D transform drag state — differentiates click (select) from drag (move)
  const [is3DDragging, setIs3DDragging] = useState(false);
  const [is3DPointerDown, setIs3DPointerDown] = useState(false);
  const drag3DStartRef = useRef<{
    clientX: number;
    clientY: number;
    tX: number;
    tY: number;
    moved: boolean;
  } | null>(null);

  const handle3DDragDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const p3d = useImageStore.getState().perspective3D;
    drag3DStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      tX: p3d.translateX,
      tY: p3d.translateY,
      moved: false,
    };
    setIs3DPointerDown(true);
    // Select the image on click/drag start
    setIsMainImageSelected(true);
    setSelectedOverlayId(null);
    setSelectedTextId(null);
  }, []);

  useEffect(() => {
    if (!is3DPointerDown) {
      return;
    }

    const DRAG_THRESHOLD = 3;

    const handleMove = (e: PointerEvent) => {
      const s = drag3DStartRef.current;
      if (!s) {
        return;
      }

      const dx = e.clientX - s.clientX;
      const dy = e.clientY - s.clientY;

      // Only start actual drag after threshold — clicks pass through
      if (!s.moved && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) {
        return;
      }
      s.moved = true;
      setIs3DDragging(true);

      const sensitivity = 0.15;
      const newTX = Math.max(-30, Math.min(30, s.tX + dx * sensitivity));
      const newTY = Math.max(-30, Math.min(30, s.tY + dy * sensitivity));

      useImageStore.getState().setPerspective3D({
        translateX: Math.round(newTX * 10) / 10,
        translateY: Math.round(newTY * 10) / 10,
      });
    };

    const handleUp = () => {
      setIs3DDragging(false);
      setIs3DPointerDown(false);
      drag3DStartRef.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [is3DPointerDown]);

  const containerWidth = responsiveDimensions.width;
  const containerHeight = responsiveDimensions.height;

  const bgImage = useBackgroundImage(
    backgroundConfig,
    containerWidth,
    containerHeight
  );
  const loadedOverlayImages = useOverlayImages(imageOverlays);

  // Update global reference for export
  useEffect(() => {
    if (canvasContainerRef.current) {
      globalCanvasContainer = canvasContainerRef.current;
    }
    return () => {
      globalCanvasContainer = null;
    };
  }, []);

  // Clear selection when clicking outside of canvas
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      if (!container.contains(target)) {
        // Don't deselect when interacting with editor panel controls
        // (sliders, inputs, buttons, etc.) so users can tweak selected items
        const el = target as HTMLElement;
        if (
          el.closest?.(
            '[data-slot="slider"], input, button, [role="button"], [data-radix-collection-item], .moveable-control-box, [data-resize-handle]'
          )
        ) {
          return;
        }

        setSelectedOverlayId(null);
        setIsMainImageSelected(false);
        setSelectedTextId(null);
        setSelectedBlurId(null);
        setSelectedAnnotationId(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [setSelectedAnnotationId]);

  // Keyboard shortcuts for delete and undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Delete selected overlay or main image (only when not typing)
      if ((e.key === "Delete" || e.key === "Backspace") && !isTyping) {
        if (selectedOverlayId) {
          e.preventDefault();
          removeImageOverlay(selectedOverlayId);
          setSelectedOverlayId(null);
        } else if (isMainImageSelected) {
          e.preventDefault();
          useImageStore.getState().clearImage();
          setIsMainImageSelected(false);
        }
      }

      // Undo/Redo (only when not typing)
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "z" &&
        !isTyping
      ) {
        e.preventDefault();
        const { undo, redo } = useImageStore.temporal.getState();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOverlayId, removeImageOverlay, isMainImageSelected]);

  // Get selected overlay for toolbar positioning
  const selectedOverlay = selectedOverlayId
    ? imageOverlays.find((o) => o.id === selectedOverlayId)
    : null;

  // Handle duplicate overlay
  const handleDuplicateOverlay = () => {
    if (!selectedOverlay) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...overlayWithoutId } = selectedOverlay;
    addImageOverlay({
      ...overlayWithoutId,
      position: {
        x: selectedOverlay.position.x + 30,
        y: selectedOverlay.position.y + 30,
      },
    });
  };

  // Handle delete overlay
  const handleDeleteOverlay = () => {
    if (!selectedOverlayId) {
      return;
    }
    removeImageOverlay(selectedOverlayId);
    setSelectedOverlayId(null);
  };

  useEffect(() => {
    if (backgroundNoise > 0) {
      const intensity = backgroundNoise / 100;
      const noiseCanvas = generateNoiseTexture(200, 200, intensity);
      setNoiseTexture(noiseCanvas);
    } else {
      setNoiseTexture(null);
    }
  }, [backgroundNoise]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    if (!patternStyle.enabled) {
      setPatternImage(null);
      return;
    }

    const newPattern = generatePattern(
      patternStyle.type,
      patternStyle.scale,
      patternStyle.spacing,
      patternStyle.color,
      patternStyle.rotation,
      patternStyle.blur
    );
    setPatternImage(newPattern);
  }, [
    patternStyle.enabled,
    patternStyle.type,
    patternStyle.scale,
    patternStyle.spacing,
    patternStyle.color,
    patternStyle.rotation,
    patternStyle.blur,
  ]);

  useEffect(() => {
    if (!noise.enabled || noise.type === "none") {
      setNoiseImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setNoiseImage(img);
    img.onerror = () => setNoiseImage(null);
    img.src = `/${noise.type}.jpg`;
  }, [noise.enabled, noise.type]);

  const dimensions = calculateCanvasDimensions(
    image,
    containerWidth,
    containerHeight,
    viewportSize,
    canvas,
    screenshot,
    frame,
    browserHeaderSize
  );

  const {
    canvasW,
    canvasH,
    imageScaledW,
    imageScaledH,
    framedW,
    framedH,
    frameOffset,
    windowPadding,
    windowHeader,
    eclipseBorder,
    groupCenterX,
    groupCenterY,
  } = dimensions;

  // Store canvas dimensions so editor panels can calculate position presets
  const setCanvasDimensions = useImageStore((s) => s.setCanvasDimensions);
  useEffect(() => {
    setCanvasDimensions({ canvasW, canvasH, framedW, framedH });
  }, [canvasW, canvasH, framedW, framedH, setCanvasDimensions]);

  const showFrame = frame.enabled && frame.type !== "none";

  let selectedSelector: string | null = null;
  if (isMainImageSelected) {
    selectedSelector = '[data-main-image-layer="true"]';
  } else if (selectedOverlayId) {
    selectedSelector = `[data-overlay-id="${CSS.escape(selectedOverlayId)}"]`;
  }

  const has3DTransform =
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1;

  // Deselect everything on mousedown on the canvas background.
  // Child elements (image, overlays) call e.stopPropagation() on mousedown,
  // so this only fires when clicking empty canvas area.
  const handleCanvasDeselect = (e: React.PointerEvent) => {
    // Don't deselect when interacting with resize/rotate handles
    const target = e.target as HTMLElement;
    if (target.closest?.(".moveable-control-box, [data-resize-handle]")) {
      return;
    }

    setSelectedOverlayId(null);
    setIsMainImageSelected(false);
    setSelectedTextId(null);
    setSelectedBlurId(null);
    setSelectedAnnotationId(null);
  };

  return (
    <div
      className="flex items-center justify-center"
      id="image-render-card"
      ref={containerRef}
      style={{
        // width: `${containerWidth}px`,
        // maxWidth: `${containerWidth}px`,
        aspectRatio: responsiveDimensions.aspectRatio,
        // maxHeight: "calc(100vh - 200px)",
        backgroundColor: "transparent",
        padding: "0px",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "inline-block",
          lineHeight: 0,
          ...(showRulers ? { marginTop: 20, marginLeft: 20 } : {}),
        }}
      >
        {showRulers && (
          <CanvasRulers
            canvasRef={canvasContainerRef}
            canvasW={canvasW}
            majorEvery={rulerInterval}
            selectedSelector={selectedSelector}
          />
        )}
        <HTMLCanvasRenderer
          borderRadius={backgroundBorderRadius}
          height={canvasH}
          onPointerDown={handleCanvasDeselect}
          ref={canvasContainerRef}
          style={{
            isolation: "isolate",
          }}
          width={canvasW}
        >
          {/* Background Layer */}
          <HTMLBackgroundLayer
            backgroundBlur={backgroundBlur}
            backgroundBorderRadius={backgroundBorderRadius}
            backgroundConfig={backgroundConfig}
            backgroundNoise={backgroundNoise}
            height={canvasH}
            noiseTexture={noiseTexture}
            width={canvasW}
          />

          {/* Pattern Layer */}
          <HTMLPatternLayer
            height={canvasH}
            patternImage={patternImage}
            patternOpacity={patternStyle.opacity}
            width={canvasW}
          />

          {/* Noise Layer */}
          <HTMLNoiseLayer
            height={canvasH}
            noiseImage={noiseImage}
            noiseOpacity={noise.opacity}
            width={canvasW}
          />

          {/* 3D Transform Overlay - renders when 3D transforms are active */}
          <Perspective3DOverlay
            canvasH={canvasH}
            canvasW={canvasW}
            eclipseBorder={eclipseBorder}
            frame={frame}
            framedH={framedH}
            framedW={framedW}
            frameOffset={frameOffset}
            groupCenterX={groupCenterX}
            groupCenterY={groupCenterY}
            has3DTransform={has3DTransform}
            image={image}
            imageFilters={imageFilters}
            imageOpacity={imageOpacity}
            imageScaledH={imageScaledH}
            imageScaledW={imageScaledW}
            perspective3D={perspective3D}
            screenshot={screenshot}
            shadow={shadow}
            showFrame={showFrame}
            windowHeader={windowHeader}
            windowPadding={windowPadding}
          />

          {/* 3D Drag Layer - allows dragging image when 3D transforms are active */}
          {has3DTransform && (
            <div
              onPointerDown={handle3DDragDown}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: `${canvasW}px`,
                height: `${canvasH}px`,
                zIndex: 16,
                cursor: is3DDragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            />
          )}

          {/* Back Image Overlays - rendered behind the main image */}
          {backOverlays.length > 0 && (
            <HTMLImageOverlayLayer
              imageOverlays={backOverlays}
              loadedOverlayImages={loadedOverlayImages}
              onDelete={handleDeleteOverlay}
              onDuplicate={handleDuplicateOverlay}
              selectedOverlayId={selectedOverlayId}
              setIsMainImageSelected={setIsMainImageSelected}
              setSelectedOverlayId={setSelectedOverlayId}
              setSelectedTextId={setSelectedTextId}
              updateImageOverlay={updateImageOverlay}
              zIndex={10}
            />
          )}

          {/* Main Image Layer - renders when no 3D transform and no mockups */}
          {!(hasMockups || has3DTransform) && (
            <>
              <SnapAlignmentGuides
                canvasH={canvasH}
                canvasW={canvasW}
                isDragging={isDraggingMainImage}
                offsetX={screenshot.offsetX}
                offsetY={screenshot.offsetY}
              />
              <HTMLMainImageLayer
                canvasH={canvasH}
                canvasW={canvasW}
                frame={frame}
                framedH={framedH}
                framedW={framedW}
                frameOffset={frameOffset}
                image={image}
                imageFilters={imageFilters}
                imageOpacity={imageOpacity}
                imageScaledH={imageScaledH}
                imageScaledW={imageScaledW}
                isMainImageSelected={isMainImageSelected}
                onDragStateChange={setIsDraggingMainImage}
                screenshot={screenshot}
                setIsMainImageSelected={setIsMainImageSelected}
                setScreenshot={setScreenshot}
                setSelectedOverlayId={setSelectedOverlayId}
                setSelectedTextId={setSelectedTextId}
                shadow={shadow}
                showFrame={showFrame}
                windowHeader={windowHeader}
                windowPadding={windowPadding}
              />
            </>
          )}

          {/* Mockups Layer */}
          {mockups.map((mockup) => (
            <MockupRenderer
              canvasHeight={canvasH}
              canvasWidth={canvasW}
              key={mockup.id}
              mockup={mockup}
            />
          ))}

          {/* Text Overlay Layer */}
          <HTMLTextOverlayLayer
            canvasH={canvasH}
            canvasW={canvasW}
            selectedTextId={selectedTextId}
            setIsMainImageSelected={setIsMainImageSelected}
            setSelectedOverlayId={setSelectedOverlayId}
            setSelectedTextId={setSelectedTextId}
            textOverlays={textOverlays}
            updateTextOverlay={updateTextOverlay}
          />

          {/* Front Image Overlay Layer */}
          <HTMLImageOverlayLayer
            imageOverlays={frontOverlays}
            loadedOverlayImages={loadedOverlayImages}
            onDelete={handleDeleteOverlay}
            onDuplicate={handleDuplicateOverlay}
            selectedOverlayId={selectedOverlayId}
            setIsMainImageSelected={setIsMainImageSelected}
            setSelectedOverlayId={setSelectedOverlayId}
            setSelectedTextId={setSelectedTextId}
            updateImageOverlay={updateImageOverlay}
          />

          {/* Blur Region Layer */}
          <HTMLBlurRegionLayer
            blurRegions={blurRegions}
            removeBlurRegion={removeBlurRegion}
            selectedBlurId={selectedBlurId}
            setSelectedBlurId={setSelectedBlurId}
            updateBlurRegion={updateBlurRegion}
          />

          {/* SVG Annotation Layer */}
          <SVGAnnotationLayer
            activeAnnotationTool={activeAnnotationTool}
            addAnnotation={addAnnotation}
            annotationDefaults={annotationDefaults}
            annotations={annotations}
            canvasH={canvasH}
            canvasW={canvasW}
            onDrawBlurRegion={(rect) => {
              addBlurRegion({
                position: { x: rect.x, y: rect.y },
                size: { width: rect.w, height: rect.h },
                blurAmount: 10,
                isVisible: true,
              });
            }}
            removeAnnotation={removeAnnotation}
            selectedAnnotationId={selectedAnnotationId}
            setActiveAnnotationTool={setActiveAnnotationTool}
            setSelectedAnnotationId={setSelectedAnnotationId}
            updateAnnotation={updateAnnotationShape}
          />

          {/* Toolbar is now integrated inside HTMLImageOverlayLayer */}

          {/* Grid overlay — rendered on top of all content layers */}
          {showGrid && <HTMLGridLayer canvasH={canvasH} canvasW={canvasW} />}
        </HTMLCanvasRenderer>
      </div>
    </div>
  );
}

export function getCanvasContainer(): HTMLDivElement | null {
  return globalCanvasContainer;
}

export default function ClientCanvas() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { screenshot, setScreenshot } = useEditorStore();
  const { uploadedImageUrl } = useImageStore();

  // Load primary image from screenshot.src
  useEffect(() => {
    setLoadError(false);

    if (!(screenshot.src && uploadedImageUrl)) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    const timeoutId = setTimeout(() => {
      if (!img.complete) {
        console.warn("Image load timeout");
        setLoadError(true);
        setScreenshot({ src: null });
      }
    }, 10_000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImage(img);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      console.warn("Image load error");
      setLoadError(true);
      setScreenshot({ src: null });
    };

    img.src = screenshot.src;

    return () => {
      clearTimeout(timeoutId);
    };
  }, [screenshot.src, uploadedImageUrl, setScreenshot]);

  if (loadError || !screenshot.src || !uploadedImageUrl) {
    return null;
  }

  if (!image) {
    return (
      <div className="flex min-h-[400px] flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return <CanvasRenderer image={image} />;
}
