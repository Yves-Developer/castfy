"use client";

import { cn } from "@castfy/ui/lib/utils";
import type React from "react";

interface SegmentedControlOption {
  ariaLabel?: string;
  icon?: React.ReactNode;
  id: string;
  label?: string;
}

interface SegmentedControlProps {
  className?: string;
  indicatorClassName?: string;
  onChange: (value: string) => void;
  options: SegmentedControlOption[];
  size?: "sm" | "md";
  value: string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  className,
  indicatorClassName,
  size = "md",
}: SegmentedControlProps) {
  const activeIndex = options.findIndex((o) => o.id === value);

  return (
    <div
      className={cn(
        "relative flex border border-border/20 bg-muted dark:bg-muted/80",
        size === "sm" ? "rounded-[10px] p-[2px]" : "rounded-xl p-0.5",
        className
      )}
    >
      <div
        className={cn(
          "absolute bg-background transition-all duration-200 ease-out dark:bg-accent",
          size === "sm"
            ? "top-[2px] bottom-[2px] rounded-[8px]"
            : "top-0.5 bottom-0.5 rounded-[10px]",
          indicatorClassName
        )}
        style={{
          left: `calc(${activeIndex * (100 / options.length)}% + 2px)`,
          width: `calc(${100 / options.length}% - 4px)`,
        }}
      />
      {options.map((option) => (
        <button
          aria-label={option.ariaLabel ?? option.label}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 transition-colors duration-150",
            size === "sm"
              ? "rounded-[8px] px-2 py-1.5"
              : "rounded-[10px] px-2.5 py-2",
            value === option.id
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          key={option.id}
          onClick={() => onChange(option.id)}
          title={option.ariaLabel ?? option.label}
          type="button"
        >
          {option.icon}
          {option.label && (
            <span
              className={cn(
                "font-medium",
                size === "sm" ? "text-[10px]" : "text-[11px]"
              )}
            >
              {option.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
