"use client";

import { cn } from "@castfy/ui/lib/utils";
import { type ShadowPreset, useImageStore } from "@/lib/store";

const shadowPresets: { value: ShadowPreset; label: string; shadow: string }[] =
  [
    { value: "none", label: "None", shadow: "none" },
    {
      value: "hug",
      label: "Hug",
      shadow:
        "rgba(0,0,0,0.2) 0px 2px 12px 0px, rgba(0,0,0,0.14) 0px 1px 4px 0px",
    },
    {
      value: "soft",
      label: "Soft",
      shadow:
        "rgba(0,0,0,0.28) 0px 12px 48px 0px, rgba(0,0,0,0.18) 0px 4px 12px 0px",
    },
    {
      value: "strong",
      label: "Strong",
      shadow:
        "rgba(0,0,0,0.45) 0px 24px 80px 0px, rgba(0,0,0,0.3) 0px 8px 24px 0px",
    },
  ];

function ShadowPreview({
  shadow,
  selected,
}: {
  shadow: string;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-lg transition-all",
        selected
          ? "ring-[1.5px] ring-primary ring-offset-1 ring-offset-card"
          : "ring-1 ring-border/50"
      )}
      style={{ backgroundColor: "rgb(210, 210, 214)" }}
    >
      <div
        className="absolute rounded-[10px] bg-white"
        style={{
          top: "26%",
          left: "26%",
          width: "95%",
          height: "95%",
          boxShadow: shadow,
        }}
      />
    </div>
  );
}

export function ShadowSection() {
  const { shadowPreset, setShadowPreset } = useImageStore();

  return (
    <div className="grid grid-cols-2 gap-2 p-1">
      {shadowPresets.map(({ value, label, shadow }) => {
        const isSelected = shadowPreset === value;
        return (
          <button
            className="group flex flex-col items-center gap-1.5"
            key={value}
            onClick={() => setShadowPreset(value)}
            type="button"
          >
            <ShadowPreview selected={isSelected} shadow={shadow} />
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
  );
}
