"use client";

import { Button } from "@castfy/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@castfy/ui/components/popover";
import { AspectRatioIcon } from "hugeicons-react";
import { useState } from "react";
import { AspectRatioPicker } from "@/components/aspect-ratio/aspect-ratio-picker";
import { aspectRatios } from "@/lib/constants/aspect-ratios";
import { useImageStore } from "@/lib/store";

export function AspectRatio() {
  const { selectedAspectRatio } = useImageStore();
  const [aspectRatioOpen, setAspectRatioOpen] = useState(false);
  const currentAspectRatio = aspectRatios.find(
    (ar) => ar.id === selectedAspectRatio
  );
  return (
    <Popover onOpenChange={setAspectRatioOpen} open={aspectRatioOpen}>
      <PopoverTrigger asChild>
        <Button
          className="h-8 gap-1.5 rounded-lg px-2.5 text-muted-foreground hover:text-foreground"
          size="sm"
          variant="ghost"
        >
          <AspectRatioIcon size={15} />
          <span className="text-xs">
            {currentAspectRatio
              ? `${currentAspectRatio.width}:${currentAspectRatio.height}`
              : "Auto"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[420px] p-0"
        collisionPadding={16}
        sideOffset={8}
      >
        <AspectRatioPicker onSelect={() => setAspectRatioOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
