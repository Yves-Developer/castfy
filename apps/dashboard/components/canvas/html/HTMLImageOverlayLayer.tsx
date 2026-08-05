/** biome-ignore-all lint/correctness/useImageSize: <explanation> */
/** biome-ignore-all lint/performance/noImgElement: <explanation> */
"use client";

import { cn } from "@castfy/ui/lib/utils";
import {
  CopyIcon,
  LayersMinusIcon,
  LayersPlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import Moveable from "react-moveable";
import type { ImageOverlay } from "@/lib/store";

// ── Types ────────────────────────────────────────────────────────────────────

interface HTMLImageOverlayLayerProps {
  imageOverlays: ImageOverlay[];
  loadedOverlayImages: Record<string, HTMLImageElement>;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  selectedOverlayId: string | null;
  setIsMainImageSelected: (selected: boolean) => void;
  setSelectedOverlayId: (id: string | null) => void;
  setSelectedTextId: (id: string | null) => void;
  updateImageOverlay: (id: string, updates: Partial<ImageOverlay>) => void;
  zIndex?: number;
}

// ── Single overlay element ───────────────────────────────────────────────────

function OverlayElement({
  overlay,
  overlayImg,
  onSelect,
  elRef,
}: {
  overlay: ImageOverlay;
  overlayImg: HTMLImageElement;
  onSelect: () => void;
  elRef: (el: HTMLDivElement | null) => void;
}) {
  const isShadow = useMemo(
    () =>
      typeof overlay.src === "string" && overlay.src.includes("overlay-shadow"),
    [overlay.src]
  );

  if (!overlay.isVisible) {
    return null;
  }

  if (isShadow) {
    return (
      <div
        data-overlay-id={overlay.id}
        ref={elRef}
        style={{
          position: "absolute",
          inset: 0,
          opacity: overlay.opacity,
          userSelect: "none",
          zIndex: 5,
          pointerEvents: "none",
        }}
      >
        {/** biome-ignore lint/correctness/useImageSize: <explanation> */}
        <img
          alt="Shadow overlay"
          draggable={false}
          src={overlayImg.src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>
    );
  }

  const flipTransform = [
    overlay.flipX ? "scaleX(-1)" : "",
    overlay.flipY ? "scaleY(-1)" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-overlay-id={overlay.id}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      ref={elRef}
      style={{
        position: "absolute",
        left: `${overlay.position.x - overlay.size / 2}px`,
        top: `${overlay.position.y - overlay.size / 2}px`,
        width: `${overlay.size}px`,
        height: `${overlay.size}px`,
        transform: `rotate(${overlay.rotation}deg)`,
        opacity: overlay.opacity,
        filter: (overlay.blur ?? 0) > 0 ? `blur(${overlay.blur}px)` : undefined,
        cursor: "grab",
        userSelect: "none",
        pointerEvents: "auto",
      }}
    >
      <img
        alt="Overlay"
        draggable={false}
        src={overlayImg.src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          transform: flipTransform || undefined,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

// ── Context toolbar (minimal, bottom-anchored) ──────────────────────────────

function ContextToolbar({
  overlay,
  onUpdate,
  onDuplicate,
  onDelete,
}: {
  overlay: ImageOverlay;
  onUpdate: (updates: Partial<ImageOverlay>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const isFront = (overlay.layer || "front") === "front";

  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[calc(100%+8px)]",
        "z-[999] flex items-center gap-1 px-1.5 py-1",
        "rounded-lg bg-card/90 backdrop-blur-md",
        "border border-border/50 shadow-lg",
        "fade-in-0 zoom-in-95 animate-in duration-100"
      )}
      onPointerDown={(e) => e.stopPropagation()}
      style={{ pointerEvents: "auto" }}
    >
      <button
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md transition-colors duration-100",
          "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onUpdate({ layer: isFront ? "back" : "front" });
        }}
        title={isFront ? "Send behind image" : "Bring to front"}
        type="button"
      >
        {isFront ? <LayersMinusIcon size={15} /> : <LayersPlusIcon size={15} />}
      </button>
      <button
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-100 hover:bg-accent hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        title="Duplicate"
        type="button"
      >
        <CopyIcon size={15} />
      </button>
      <div className="h-4 w-px bg-border/50" />
      <button
        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors duration-100 hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
        type="button"
      >
        <Trash2Icon size={15} />
      </button>
    </div>
  );
}

// ── Main layer component ─────────────────────────────────────────────────────

export function HTMLImageOverlayLayer({
  imageOverlays,
  loadedOverlayImages,
  selectedOverlayId,
  setSelectedOverlayId,
  setIsMainImageSelected,
  setSelectedTextId,
  updateImageOverlay,
  onDuplicate,
  onDelete,
  zIndex = 200,
}: HTMLImageOverlayLayerProps) {
  const overlayRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [interacting, setInteracting] = useState(false);

  const setOverlayRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) {
        overlayRefs.current.set(id, el);
      } else {
        overlayRefs.current.delete(id);
      }
    },
    []
  );

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedOverlayId(id);
      setIsMainImageSelected(false);
      setSelectedTextId(null);
    },
    [setSelectedOverlayId, setIsMainImageSelected, setSelectedTextId]
  );

  const selectedOverlay = selectedOverlayId
    ? imageOverlays.find((o) => o.id === selectedOverlayId)
    : null;

  const selectedEl = selectedOverlayId
    ? (overlayRefs.current.get(selectedOverlayId) ?? null)
    : null;
  const isShadow = selectedOverlay?.src.includes("overlay-shadow");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex,
        overflow: "visible",
      }}
    >
      {imageOverlays.map((overlay) => {
        if (!overlay.isVisible) {
          return null;
        }
        const overlayImg = loadedOverlayImages[overlay.id];
        if (!overlayImg) {
          return null;
        }

        return (
          <OverlayElement
            elRef={setOverlayRef(overlay.id)}
            key={overlay.id}
            onSelect={() => handleSelect(overlay.id)}
            overlay={overlay}
            overlayImg={overlayImg}
          />
        );
      })}

      {/* Moveable + Context toolbar for selected overlay */}
      {selectedOverlay && selectedEl && !isShadow && (
        <>
          <Moveable
            draggable={true}
            edge={false}
            keepRatio={true}
            onDrag={({ target, left, top }) => {
              target.style.left = `${left}px`;
              target.style.top = `${top}px`;
            }}
            onDragEnd={({ target }) => {
              setInteracting(false);
              const left = Number.parseFloat(target.style.left);
              const top = Number.parseFloat(target.style.top);
              const w = Number.parseFloat(target.style.width);
              const h = Number.parseFloat(target.style.height);
              updateImageOverlay(selectedOverlay.id, {
                position: { x: left + w / 2, y: top + h / 2 },
              });
            }}
            onDragStart={() => setInteracting(true)}
            onResize={({ target, width, height, drag }) => {
              target.style.width = `${width}px`;
              target.style.height = `${height}px`;
              target.style.left = `${drag.left}px`;
              target.style.top = `${drag.top}px`;
            }}
            onResizeEnd={({ target }) => {
              setInteracting(false);
              const w = Number.parseFloat(target.style.width);
              const h = Number.parseFloat(target.style.height);
              const left = Number.parseFloat(target.style.left);
              const top = Number.parseFloat(target.style.top);
              updateImageOverlay(selectedOverlay.id, {
                size: Math.round(Math.max(w, h)),
                position: { x: left + w / 2, y: top + h / 2 },
              });
            }}
            onResizeStart={() => setInteracting(true)}
            onRotate={({ target, transform }) => {
              target.style.transform = transform;
            }}
            onRotateEnd={({ target }) => {
              setInteracting(false);
              const match = target.style.transform.match(
                /rotate\(([-\d.]+)deg\)/
              );
              if (match) {
                let deg = Number.parseFloat(match[1]) % 360;
                if (deg > 180) {
                  deg -= 360;
                }
                if (deg < -180) {
                  deg += 360;
                }
                updateImageOverlay(selectedOverlay.id, {
                  rotation: Math.round(deg),
                });
              }
            }}
            onRotateStart={() => setInteracting(true)}
            origin={false}
            renderDirections={["nw", "ne", "sw", "se"]}
            resizable={true}
            rotatable={true}
            rotationPosition={"top"}
            target={selectedEl}
            throttleDrag={0}
            throttleResize={0}
            throttleRotate={0}
          />

          {/* Minimal context toolbar below the selected overlay */}
          {!interacting && (
            <div
              style={{
                position: "absolute",
                left: `${selectedOverlay.position.x - selectedOverlay.size / 2}px`,
                top: `${selectedOverlay.position.y - selectedOverlay.size / 2}px`,
                width: `${selectedOverlay.size}px`,
                height: `${selectedOverlay.size}px`,
                pointerEvents: "none",
              }}
            >
              <ContextToolbar
                onDelete={() => onDelete?.(selectedOverlay.id)}
                onDuplicate={() => onDuplicate?.(selectedOverlay.id)}
                onUpdate={(updates) =>
                  updateImageOverlay(selectedOverlay.id, updates)
                }
                overlay={selectedOverlay}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
