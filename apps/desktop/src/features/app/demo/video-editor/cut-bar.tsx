"use client";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { Loader2Icon, RotateCcwIcon, ScissorsIcon, Volume2Icon } from "lucide-react";
import type { CutsApi } from "../use-cuts";

/**
 * Controls for the cut edit.
 *
 * The mode switch is not a preference — the two sources are different videos.
 * Editing runs on the raw recording, which is the only thing cut ranges are
 * measured against and which has no audio track. The finished variant carries
 * the narration but already has the cuts baked in, so it cannot be edited on.
 */
export function CutBar({
  cutsApi,
  mode,
  onModeChange,
  hasResult,
  visible,
}: {
  cutsApi: CutsApi;
  mode: "edit" | "result";
  onModeChange: (mode: "edit" | "result") => void;
  hasResult: boolean;
  visible: boolean;
}) {
  if (!visible) return null;

  const { cuts, edited, isAiCut, busy, error, narrationStale } = cutsApi;
  const removedMs = cuts.reduce((sum, cut) => sum + (cut.endMs - cut.startMs), 0);

  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="flex items-center gap-0.5 rounded-md bg-muted/60 p-0.5">
        <ModeButton
          active={mode === "edit"}
          icon={<ScissorsIcon className="size-3" />}
          label="Edit cuts"
          onClick={() => onModeChange("edit")}
        />
        <ModeButton
          active={mode === "result"}
          disabled={!hasResult}
          icon={<Volume2Icon className="size-3" />}
          label="Result"
          onClick={() => onModeChange("result")}
          title={
            hasResult
              ? "Play the finished video, with narration"
              : "No narrated export yet — apply an edit or record with narration"
          }
        />
      </div>

      <span className="text-muted-foreground">
        {mode === "edit"
          ? `${cuts.length} cuts · ${(removedMs / 1000).toFixed(1)}s removed`
          : "Finished video"}
      </span>

      {error ? <span className="text-destructive">{error}</span> : null}

      {narrationStale && !edited ? (
        <span className="text-amber-500">Narration is out of date with this edit</span>
      ) : null}

      <div className="ml-auto flex items-center gap-1.5">
        {mode === "edit" && !isAiCut ? (
          <Button
            className="h-7 gap-1.5 text-xs"
            disabled={busy}
            onClick={cutsApi.reset}
            size="sm"
            variant="ghost"
          >
            <RotateCcwIcon className="size-3" />
            Reset to AI edit
          </Button>
        ) : null}

        {edited && mode === "edit" ? (
          <>
            <Button
              className="h-7 text-xs"
              disabled={busy}
              onClick={() => cutsApi.applyToVideo()}
              size="sm"
            >
              {busy ? (
                <>
                  <Loader2Icon className="size-3 animate-spin" />
                  Rendering…
                </>
              ) : (
                "Apply to video"
              )}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  disabled,
  icon,
  label,
  onClick,
  title,
}: {
  active: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
        disabled && "opacity-40"
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}
