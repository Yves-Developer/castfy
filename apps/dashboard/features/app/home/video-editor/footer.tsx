import { Button } from "@castfy/ui/components/button";
import {
  PlayIcon,
  ScissorsIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { AspectRatio } from "./aspect-ratio";

export function EditorFooter() {
  return (
    <div className="mt-auto flex w-full items-center">
      <div className="flex-1">
        <Button
          className="rounded-full text-muted-foreground hover:text-primary"
          size="icon"
          variant={"ghost"}
        >
          <ZoomInIcon />
        </Button>
        <Button
          className="rounded-full text-muted-foreground hover:text-primary"
          size="icon"
          variant={"ghost"}
        >
          <ZoomOutIcon />
        </Button>
        <Button
          className="rounded-full text-muted-foreground hover:text-primary"
          size="icon"
          variant={"ghost"}
        >
          <ScissorsIcon />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2">
        <p className="text-muted-foreground text-xs">0:01</p>
        <Button
          className={"rounded-full text-muted-foreground"}
          size="icon"
          variant="ghost"
        >
          <SkipBackIcon />
        </Button>
        <Button className="rounded-full" size="icon">
          <PlayIcon />
        </Button>
        <Button
          className={"rounded-full text-muted-foreground"}
          size="icon"
          variant="ghost"
        >
          <SkipForwardIcon />
        </Button>
        <p className="text-muted-foreground text-xs">1:46</p>
      </div>
      <div className="flex flex-1 justify-end">
        <AspectRatio />
        <Button
          className="rounded-full text-muted-foreground hover:text-primary"
          size="icon"
          variant={"ghost"}
        >
          <Volume2Icon />
        </Button>
      </div>
    </div>
  );
}
