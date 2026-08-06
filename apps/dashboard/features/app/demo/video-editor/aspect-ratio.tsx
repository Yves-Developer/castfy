"use client";

import { Button } from "@castfy/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
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
    <DropdownMenu onOpenChange={setAspectRatioOpen} open={aspectRatioOpen}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-105 p-0" sideOffset={8}>
        <AspectRatioPicker onSelect={() => setAspectRatioOpen(false)} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
