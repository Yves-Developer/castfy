"use client";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import {
  PauseIcon,
  PlayIcon,
  Redo2Icon,
  SkipBackIcon,
  SkipForwardIcon,
  Undo2Icon,
} from "lucide-react";
import React from "react";
import { useImageStore } from "@/lib/store";
import { AspectRatio } from "./aspect-ratio";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

interface EditorFooterProps {
  currentTime: number;
  duration: number;
  isMuted: boolean;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  volume: number;
}

export function EditorFooter({
  currentTime,
  duration,
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
}: EditorFooterProps) {
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  React.useEffect(() => {
    const updateTemporalState = () => {
      const { pastStates, futureStates } = useImageStore.temporal.getState();
      setCanUndo(pastStates.length > 0);
      setCanRedo(futureStates.length > 0);
    };
    updateTemporalState();
    const unsubscribe = useImageStore.temporal.subscribe(updateTemporalState);
    return unsubscribe;
  }, []);

  const handleUndo = React.useCallback(() => {
    const { undo, pastStates } = useImageStore.temporal.getState();
    if (pastStates.length > 0) {
      undo();
    }
  }, []);

  const handleRedo = React.useCallback(() => {
    const { redo, futureStates } = useImageStore.temporal.getState();
    if (futureStates.length > 0) {
      redo();
    }
  }, []);

  return (
    <div className="mt-auto flex w-full items-center gap-4">
      <div className="flex-1">
        <Button
          aria-label="Undo"
          className={cn(
            "rounded-full",
            "text-muted-foreground transition-all duration-150",
            canUndo ? "active:scale-95" : "cursor-not-allowed opacity-40"
          )}
          disabled={!canUndo}
          onClick={handleUndo}
          size="icon"
          title="Undo (Cmd+Z)"
          variant={"ghost"}
        >
          <Undo2Icon />
        </Button>
        <Button
          aria-label="Redo"
          className={cn(
            "rounded-full",
            "text-muted-foreground transition-all duration-150",
            canRedo
              ? "hover:bg-accent hover:text-foreground active:scale-95"
              : "cursor-not-allowed opacity-40"
          )}
          disabled={!canRedo}
          onClick={handleRedo}
          size="icon"
          title="Redo (Cmd+Shift+Z)"
          variant={"ghost"}
        >
          <Redo2Icon />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center gap-2 font-medium">
        <p className="min-w-7 text-muted-foreground text-xs">
          {formatTime(currentTime)}
        </p>
        <Button
          aria-label="Rewind 10 seconds"
          className={"rounded-full text-muted-foreground"}
          onClick={onSkipBack}
          size="icon"
          title="Rewind 10 seconds"
          variant="ghost"
        >
          <SkipBackIcon strokeWidth={2.5} />
        </Button>
        <Button
          aria-label={isPlaying ? "Pause" : "Play"}
          className="rounded-full"
          onClick={onPlayPause}
          size="icon"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <PauseIcon strokeWidth={2.5} />
          ) : (
            <PlayIcon strokeWidth={2.5} />
          )}
        </Button>
        <Button
          aria-label="Forward 10 seconds"
          className={"rounded-full text-muted-foreground"}
          onClick={onSkipForward}
          size="icon"
          title="Forward 10 seconds"
          variant="ghost"
        >
          <SkipForwardIcon strokeWidth={2.5} />
        </Button>
        <p className="min-w-7 text-muted-foreground text-xs">
          {formatTime(duration)}
        </p>
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <AspectRatio />
      </div>
    </div>
  );
}
