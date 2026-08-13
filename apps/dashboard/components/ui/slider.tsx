"use client";

import { cn } from "@castfy/ui/lib/utils";
// biome-ignore lint/performance/noNamespaceImport: <explanation
import * as SliderPrimitive from "@radix-ui/react-slider";
import React from "react";

interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  label?: string;
  valueDisplay?: string | number;
}

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  label,
  valueDisplay,
  ...props
}: SliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  );

  const displayValue =
    valueDisplay ??
    (Array.isArray(value)
      ? value[0]
      : (value ??
        (Array.isArray(defaultValue)
          ? defaultValue[0]
          : (defaultValue ?? min))));

  return (
    <div
      className={cn(
        "relative w-full rounded-lg bg-secondary dark:bg-background",
        className
      )}
    >
      {/* Label and value overlaid inside the slider */}
      {(label || displayValue !== undefined) && (
        <div className="pointer-events-none absolute inset-0 z-10 flex select-none items-center justify-between px-3">
          {label && (
            <span className="text-muted-foreground text-xs">{label}</span>
          )}
          <span className="ml-auto text-muted-foreground text-xs tabular-nums">
            {displayValue}
          </span>
        </div>
      )}
      <SliderPrimitive.Root
        className={cn(
          "relative flex h-8 w-full cursor-grab touch-none select-none items-center",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-disabled:opacity-50"
        )}
        data-slot="slider"
        defaultValue={defaultValue}
        max={max}
        min={min}
        value={value}
        {...props}
      >
        <SliderPrimitive.Track
          className="relative h-full w-full grow overflow-hidden rounded-lg"
          data-slot="slider-track"
        >
          <SliderPrimitive.Range
            className="absolute h-full bg-border/30 data-[orientation=vertical]:w-full dark:bg-secondary/50"
            data-slot="slider-range"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            className="block h-5 w-1 rounded-full bg-muted-foreground/50 transition-colors hover:bg-muted-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:bg-muted-foreground/40"
            data-slot="slider-thumb"
            key={index}
          />
        ))}
      </SliderPrimitive.Root>
    </div>
  );
}

export { Slider };
