"use client";

import { cn } from "@castfy/ui/lib/utils";
import type * as React from "react";
import { Slider } from "@/components/ui/slider";
import { type ImageStylePreset, useImageStore } from "@/lib/store";

const stylePresets: { value: ImageStylePreset; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "glass-light", label: "Glass Light" },
  { value: "glass-dark", label: "Glass Dark" },
  { value: "outline", label: "Outline" },
  { value: "border-light", label: "Border" },
  { value: "border-dark", label: "Border Dark" },
];

function StylePreview({
  preset,
  selected,
}: {
  preset: ImageStylePreset;
  selected: boolean;
}) {
  const isDark = preset === "glass-dark" || preset === "border-dark";
  const outerBg = isDark ? "rgb(160, 160, 165)" : "rgb(210, 210, 214)";

  const getWrapperStyle = (): React.CSSProperties => {
    switch (preset) {
      case "default":
        return {};
      case "glass-light":
        return {
          background: "rgba(255, 255, 255, 0.3)",
          padding: "3px",
          borderRadius: "7px",
        };
      case "glass-dark":
        return {
          background: "rgba(0, 0, 0, 0.35)",
          padding: "3px",
          borderRadius: "7px",
        };
      case "outline":
        return {
          background: "rgba(255, 255, 255, 0.4)",
          padding: "2px",
          borderRadius: "7px",
        };
      case "border-light":
        return {
          background: "rgb(255, 255, 255)",
          padding: "4px",
          borderRadius: "8px",
        };
      case "border-dark":
        return {
          background: "rgb(30, 30, 30)",
          padding: "4px",
          borderRadius: "8px",
        };
      default:
        return {};
    }
  };

  const hasWrapper = preset !== "default";

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-lg transition-all",
        selected
          ? "ring-[1.5px] ring-primary ring-offset-1 ring-offset-card"
          : "ring-1 ring-border/50"
      )}
      style={{ backgroundColor: outerBg }}
    >
      <div
        className="absolute"
        style={{ top: "19.5%", left: "19.5%", width: "95.5%", height: "95.5%" }}
      >
        {hasWrapper ? (
          <div className="h-full w-full" style={getWrapperStyle()}>
            <div className="h-full w-full rounded-[5px] bg-white" />
          </div>
        ) : (
          <div className="h-full w-full rounded-[8px] bg-white" />
        )}
      </div>
    </div>
  );
}

export function StyleSection() {
  const { imageStylePreset, setImageStylePreset, imageBorder, setImageBorder } =
    useImageStore();

  const isNonDefault = imageStylePreset !== "default";
  const currentOpacity = imageBorder.opacity ?? 0.3;
  const currentPadding = imageBorder.padding ?? 2;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 p-1">
        {stylePresets.map(({ value, label }) => {
          const isSelected = imageStylePreset === value;
          return (
            <button
              className="group flex flex-col items-center gap-1.5"
              key={value}
              onClick={() => setImageStylePreset(value)}
              type="button"
            >
              <StylePreview preset={value} selected={isSelected} />
              <span
                className={cn(
                  "text-[10px] leading-tight transition-colors",
                  isSelected
                    ? "font-medium text-foreground"
                    : "text-muted-foreground group-hover:text-foreground/70"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {isNonDefault && (
        <div>
          <Slider
            label="Padding"
            max={8}
            min={0}
            onValueChange={(value) => setImageBorder({ padding: value[0] })}
            step={0.5}
            value={[currentPadding]}
            valueDisplay={currentPadding.toFixed(1)}
          />
          <Slider
            label="Opacity"
            max={100}
            min={5}
            onValueChange={(value) =>
              setImageBorder({ opacity: value[0] / 100 })
            }
            step={1}
            value={[Math.round(currentOpacity * 100)]}
            valueDisplay={`${Math.round(currentOpacity * 100)}%`}
          />
        </div>
      )}
    </div>
  );
}
