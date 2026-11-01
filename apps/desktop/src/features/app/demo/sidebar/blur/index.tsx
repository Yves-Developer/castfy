"use client";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { EyeOffIcon, SquareDashedIcon, Trash2Icon } from "lucide-react";
import { useBackgroundStore } from "@/lib/store";
import {
  formatMs,
  playheadMs,
  useBlurTool,
  videoDurationMs,
} from "../../blur/tool";

/**
 * Blur boxes: hide anything the agent left on screen, such as a personal
 * email, a customer's name or an API key. Draw a box on the video; it shows
 * from where the playhead is to the end, and its start and end can be moved
 * to the playhead.
 */
export function BlurTab() {
  const blurs = useBackgroundStore((s) => s.blurs);
  const updateBlur = useBackgroundStore((s) => s.updateBlur);
  const removeBlur = useBackgroundStore((s) => s.removeBlur);
  const { drawing, selectedId, onResult, set } = useBlurTool();
  const hasVideo = useBackgroundStore((s) => Boolean(s.generatedVideoUrl));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xs">Blur</p>
        <p className="text-[11px] text-muted-foreground">
          Hide what should not be seen: an email, a name, a key. Draw a box over
          it on the video.
        </p>
      </div>

      {onResult ? (
        <Button
          className="h-8 text-xs"
          disabled={!hasVideo}
          onClick={() => set({ drawing: !drawing, selectedId: null })}
          size="sm"
          variant={drawing ? "secondary" : "brand"}
        >
          <SquareDashedIcon className="size-3.5" />
          {drawing ? "Drag on the video… (Esc to cancel)" : "Add blur box"}
        </Button>
      ) : (
        <p className="rounded-lg border p-2.5 text-[11px] text-muted-foreground">
          Switch the player to Result to add or edit blur boxes. They are timed
          in the finished video.
        </p>
      )}

      {blurs.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed p-4 text-center">
          <EyeOffIcon className="size-4 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">
            No blur boxes yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {blurs.map((box, i) => {
            const selected = box.id === selectedId;
            return (
              <li
                className={cn(
                  "flex flex-col gap-2 rounded-lg border p-2.5",
                  selected && "border-[#09f]"
                )}
                data-castfy="blur-item"
                key={box.id}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    className="flex min-w-0 flex-1 flex-col items-start text-left"
                    onClick={() =>
                      set({
                        selectedId: selected ? null : box.id,
                        drawing: false,
                      })
                    }
                    type="button"
                  >
                    <span className="font-medium text-xs">Blur {i + 1}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {formatMs(box.startMs)} – {formatMs(box.endMs)}
                    </span>
                  </button>
                  <Button
                    aria-label={`Delete blur ${i + 1}`}
                    className="size-7"
                    onClick={() => {
                      removeBlur(box.id);
                      if (selected) {
                        set({ selectedId: null });
                      }
                    }}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2Icon className="size-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <Button
                    className="h-7 px-1 text-[11px]"
                    disabled={!onResult}
                    onClick={() => {
                      const at = playheadMs();
                      updateBlur(box.id, {
                        startMs: at,
                        endMs: Math.max(box.endMs, at + 100),
                      });
                    }}
                    size="sm"
                    title="Start this blur where the playhead is"
                    variant="outline"
                  >
                    Start here
                  </Button>
                  <Button
                    className="h-7 px-1 text-[11px]"
                    disabled={!onResult}
                    onClick={() => {
                      const at = playheadMs();
                      updateBlur(box.id, {
                        endMs: at,
                        startMs: Math.min(box.startMs, Math.max(0, at - 100)),
                      });
                    }}
                    size="sm"
                    title="End this blur where the playhead is"
                    variant="outline"
                  >
                    End here
                  </Button>
                  <Button
                    className="h-7 px-1 text-[11px]"
                    disabled={!onResult}
                    onClick={() => {
                      const duration = videoDurationMs();
                      updateBlur(box.id, {
                        startMs: 0,
                        endMs: duration > 0 ? duration : box.endMs,
                      });
                    }}
                    size="sm"
                    title="Blur this for the whole video"
                    variant="outline"
                  >
                    Whole video
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {blurs.length > 0 ? (
        <p className="text-[10px] text-muted-foreground">
          Drag a box to move it, its corners to resize it. Delete removes the
          selected one. Blurs show in the export too.
        </p>
      ) : null}
    </div>
  );
}
