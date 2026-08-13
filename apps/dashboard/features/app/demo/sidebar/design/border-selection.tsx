"use client";

import { cn } from "@castfy/ui/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useImageStore } from "@/lib/store";

const borderPresets = [
  { value: 0, label: "Sharp" },
  { value: 12, label: "Curved" },
  { value: 20, label: "Round" },
] as const;

function BorderPreview({
  radius,
  selected,
}: {
  radius: number;
  selected: boolean;
}) {
  const previewRadius = radius === 0 ? "0px" : radius === 12 ? "6px" : "12px";

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
        className="absolute"
        style={{ top: "19.5%", left: "19.5%", width: "95.5%", height: "95.5%" }}
      >
        <div
          className="h-full w-full bg-white"
          style={{ borderRadius: previewRadius }}
        />
      </div>
    </div>
  );
}

function ScaleSlider() {
  const imageScale = useImageStore((s) => s.imageScale);
  const setImageScale = useImageStore((s) => s.setImageScale);

  return (
    <Slider
      label="Scale"
      max={2}
      min={0.1}
      onValueChange={(value) => setImageScale(Math.round(value[0] * 100))}
      step={0.01}
      value={[imageScale / 100]}
      valueDisplay={(imageScale / 100).toFixed(1)}
    />
  );
}

export function BorderSection() {
  const borderRadius = useImageStore((s) => s.borderRadius);
  const setBorderRadius = useImageStore((s) => s.setBorderRadius);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 p-1">
        {borderPresets.map(({ value, label }) => {
          const isSelected = borderRadius === value;
          return (
            <button
              className="group flex flex-col items-center gap-1.5"
              key={value}
              onClick={() => setBorderRadius(value)}
              type="button"
            >
              <BorderPreview radius={value} selected={isSelected} />
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

      <Slider
        label="Radius"
        max={50}
        min={0}
        onValueChange={(value) => setBorderRadius(value[0])}
        step={1}
        value={[borderRadius]}
        valueDisplay={borderRadius}
      />
      <ScaleSlider />
    </div>
  );
}
