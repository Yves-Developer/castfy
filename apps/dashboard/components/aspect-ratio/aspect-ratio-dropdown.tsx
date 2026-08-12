import { Button } from "@castfy/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@castfy/ui/components/popover";
import { ArrowDown01Icon } from "hugeicons-react";
import React from "react";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useImageStore } from "@/lib/store";
import { AspectRatioPicker } from "./aspect-ratio-picker";

const popularRatios = ["1_1", "9_16", "16_9", "4_5", "og_image"];

export const AspectRatioDropdown = () => {
  const { selectedAspectRatio, setAspectRatio } = useImageStore();
  const current = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
  const [open, setOpen] = React.useState(false);

  const handleQuickSelect = (id: string) => {
    setAspectRatio(id);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <div className="space-y-3">
        <PopoverTrigger asChild>
          <Button
            className="h-auto w-full justify-between border-border/50 px-3 py-2.5 hover:border-border hover:bg-accent/50"
            variant="outline"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div
                className="shrink-0 rounded border border-primary/30 bg-primary/80"
                style={{
                  width: "24px",
                  height: `${24 * (current?.ratio || 1)}px`,
                  maxHeight: "24px",
                  minHeight: "10px",
                }}
              />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate font-medium text-foreground text-sm">
                  {current?.name || "Aspect Ratio"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {current
                    ? `${current.width}:${current.height}`
                    : "Select ratio"}
                </div>
              </div>
            </div>
            <ArrowDown01Icon
              className="ml-2 shrink-0 text-muted-foreground"
              size={16}
            />
          </Button>
        </PopoverTrigger>

        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Quick:</span>
          <div className="flex flex-1 items-center gap-1.5">
            {popularRatios.map((id) => {
              const ratio = aspectRatios.find((ar) => ar.id === id);
              if (!ratio) {
                return null;
              }
              const isSelected = selectedAspectRatio === id;
              return (
                <button
                  className={`relative rounded-md border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-border hover:bg-accent/50"
                  }`}
                  key={id}
                  onClick={() => handleQuickSelect(id)}
                  style={{
                    width: "32px",
                    height: `${32 * ratio.ratio}px`,
                    maxHeight: "32px",
                    minHeight: "12px",
                  }}
                  title={`${ratio.name} (${ratio.width}:${ratio.height})`}
                  type="button"
                >
                  {isSelected && (
                    <div className="absolute inset-0 rounded-md bg-primary/20" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <PopoverContent align="start" className="w-95 p-0">
        <AspectRatioPicker onSelect={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
