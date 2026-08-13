"use client";

import { cn } from "@castfy/ui/lib/utils";
import {
  AppStoreIcon,
  DribbbleIcon,
  InstagramIcon,
  NewTwitterIcon,
  PinterestIcon,
  YoutubeIcon,
} from "hugeicons-react";
import React from "react";
import { getStandardDimensions } from "@/lib/aspect-ratio-utils";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useBackgroundStore } from "@/lib/store";

interface AspectRatioPickerProps {
  onSelect?: () => void;
}

const standardRatioIds = [
  "16_9",
  "3_2",
  "4_3",
  "5_4",
  "1_1",
  "4_5",
  "3_4",
  "2_3",
  "9_16",
];

const socialSections = [
  {
    name: "Instagram",
    icon: InstagramIcon,
    presets: [
      { label: "Post", ratio: "1:1", id: "1_1" },
      { label: "Portrait", ratio: "4:5", id: "4_5" },
      { label: "Story", ratio: "9:16", id: "9_16" },
    ],
  },
  {
    name: "Twitter",
    icon: NewTwitterIcon,
    presets: [
      { label: "Tweet", ratio: "16:9", id: "16_9" },
      { label: "Cover", ratio: "3:1", id: "twitter_banner" },
    ],
  },
  {
    name: "YouTube",
    icon: YoutubeIcon,
    presets: [
      { label: "Banner", ratio: "16:9", id: "youtube_banner" },
      { label: "Thumbnail", ratio: "16:9", id: "youtube_thumbnail" },
      { label: "Video", ratio: "16:9", id: "youtube_video" },
    ],
  },
  {
    name: "Pinterest",
    icon: PinterestIcon,
    presets: [
      { label: "Long", ratio: "10:21", id: "pinterest_long" },
      { label: "Optimal", ratio: "2:3", id: "2_3" },
      { label: "Square", ratio: "1:1", id: "1_1" },
    ],
  },
  {
    name: "Dribbble",
    icon: DribbbleIcon,
    presets: [{ label: "Shot", ratio: "4:3", id: "4_3" }],
  },
  {
    name: "App Store",
    icon: AppStoreIcon,
    presets: [
      { label: 'iPhone 6.5"', ratio: "1284:2778", id: "appstore_iphone65" },
      { label: 'iPhone 5.5"', ratio: "1242:2208", id: "appstore_iphone55" },
      { label: 'iPad Pro 12.9"', ratio: "2048:2732", id: "appstore_ipad" },
      {
        label: 'iPhone 6.5" L',
        ratio: "2778:1284",
        id: "appstore_iphone65_landscape",
      },
      {
        label: 'iPhone 5.5" L',
        ratio: "2208:1242",
        id: "appstore_iphone55_landscape",
      },
      {
        label: "iPad Pro L",
        ratio: "2732:2048",
        id: "appstore_ipad_landscape",
      },
      { label: "Mac", ratio: "16:10", id: "16_10" },
    ],
  },
];

function getShapeDimensions(
  widthRatio: number,
  heightRatio: number,
  maxSize = 36
) {
  const ratio = widthRatio / heightRatio;
  let w: number, h: number;
  if (ratio >= 1) {
    w = maxSize;
    h = maxSize / ratio;
  } else {
    h = maxSize;
    w = maxSize * ratio;
  }
  return { w: Math.max(w, 10), h: Math.max(h, 10) };
}

function parseRatio(ratioStr: string) {
  const [w, h] = ratioStr.split(":").map(Number);
  return { w, h };
}

export const AspectRatioPicker = (
  { onSelect }: AspectRatioPickerProps = {} as AspectRatioPickerProps
) => {
  const {
    selectedAspectRatio,
    setAspectRatio,
    customDimensions,
    setCustomDimensions,
  } = useBackgroundStore();

  const currentAR = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
  const currentDimensions =
    selectedAspectRatio === "custom" && customDimensions
      ? customDimensions
      : currentAR
        ? getStandardDimensions(currentAR.width, currentAR.height)
        : { width: 1920, height: 1080 };

  const [customW, setCustomW] = React.useState(
    currentDimensions.width.toString()
  );
  const [customH, setCustomH] = React.useState(
    currentDimensions.height.toString()
  );

  React.useEffect(() => {
    if (selectedAspectRatio === "custom" && customDimensions) {
      setCustomW(customDimensions.width.toString());
      setCustomH(customDimensions.height.toString());
    } else if (currentAR) {
      const dims = getStandardDimensions(currentAR.width, currentAR.height);
      setCustomW(dims.width.toString());
      setCustomH(dims.height.toString());
    }
  }, [selectedAspectRatio, currentAR, customDimensions]);

  const handleSelect = (id: string) => {
    setAspectRatio(id);
    onSelect?.();
  };

  const isCustomChanged =
    customW !== currentDimensions.width.toString() ||
    customH !== currentDimensions.height.toString();

  const handleSetCustom = () => {
    const w = Number.parseInt(customW, 10);
    const h = Number.parseInt(customH, 10);
    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) {
      return;
    }
    setCustomDimensions(w, h);
    onSelect?.();
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto p-3">
      {/* Custom Dimensions */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1.5">
          <label
            className="shrink-0 font-medium text-muted-foreground text-xs"
            htmlFor="w"
          >
            W
          </label>
          <input
            className="h-8 w-full rounded-md border border-border/50 bg-muted px-2 text-foreground text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            id="w"
            onChange={(e) => setCustomW(e.target.value)}
            type="number"
            value={customW}
          />
        </div>
        <span className="text-muted-foreground text-xs">×</span>
        <div className="flex flex-1 items-center gap-1.5">
          <label
            className="shrink-0 font-medium text-muted-foreground text-xs"
            htmlFor="h"
          >
            H
          </label>
          <input
            className="h-8 w-full rounded-md border border-border/50 bg-muted px-2 text-foreground text-xs [appearance:textfield] focus:outline-none focus:ring-1 focus:ring-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            id="h"
            onChange={(e) => setCustomH(e.target.value)}
            type="number"
            value={customH}
          />
        </div>
        <button
          className={cn(
            "h-8 shrink-0 rounded-md px-3 font-medium text-xs transition-colors",
            isCustomChanged
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          )}
          disabled={!isCustomChanged}
          onClick={handleSetCustom}
          type="button"
        >
          Set
        </button>
      </div>

      {/* Standard Ratios */}
      <div className="mb-3">
        <h4 className="mb-2 font-medium text-muted-foreground text-xs">
          Standard
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {standardRatioIds.map((id) => {
            const ar = aspectRatios.find((a) => a.id === id);
            if (!ar) {
              return null;
            }
            const isSelected = selectedAspectRatio === id;
            const { w, h } = getShapeDimensions(ar.width, ar.height);
            return (
              <button
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-between rounded-lg p-2 transition-all",
                  isSelected
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "hover:bg-accent/50"
                )}
                key={id}
                onClick={() => handleSelect(id)}
                type="button"
              >
                <div className="flex h-[40px] items-center justify-center">
                  <div
                    className={cn(
                      "rounded-sm border-2 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30"
                    )}
                    style={{ width: `${w}px`, height: `${h}px` }}
                  />
                </div>
                <span className="mt-1 text-[10px] text-muted-foreground">
                  {ar.width}:{ar.height}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Media Sections */}
      {socialSections.map((section) => {
        const Icon = section.icon;
        return (
          <div className="mb-3" key={section.name}>
            <div className="mb-3 h-px bg-border/50" />
            <div className="mb-2 flex items-center gap-1.5">
              <Icon className="text-muted-foreground" size={14} />
              <h4 className="font-medium text-muted-foreground text-xs">
                {section.name}
              </h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {section.presets.map((preset) => {
                const isSelected = selectedAspectRatio === preset.id;
                const { w: rW, h: rH } = parseRatio(preset.ratio);
                const { w, h } = getShapeDimensions(rW, rH);
                const iconSize = Math.min(w, h) * 0.45;
                return (
                  <button
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-between rounded-lg p-2 transition-all",
                      isSelected
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "hover:bg-accent/50"
                    )}
                    key={`${section.name}-${preset.label}`}
                    onClick={() => handleSelect(preset.id)}
                    type="button"
                  >
                    <div className="flex h-[40px] items-center justify-center">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-sm border-2 transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/30"
                        )}
                        style={{ width: `${w}px`, height: `${h}px` }}
                      >
                        {iconSize >= 8 && (
                          <Icon
                            className={cn(
                              "transition-colors",
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground/40"
                            )}
                            size={iconSize}
                          />
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-center">
                      <span className="block text-[10px] text-muted-foreground leading-tight">
                        {preset.label}
                      </span>
                      <span className="block text-[10px] text-muted-foreground/60 leading-tight">
                        {preset.ratio}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
