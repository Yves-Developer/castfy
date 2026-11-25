import { cn } from "@castfy/ui/lib/utils";
import { GlobeIcon, MessageSquareTextIcon, PlayIcon } from "lucide-react";
import type { ReactNode } from "react";
import { type StageView, useStageView } from "./stage-view";

/**
 * The studio's big area: the live browser while the agent records (the
 * finished video after), or the agent's own thread, one click apart. The
 * choice is remembered.
 */
export function LiveStage({
  live,
  browser,
  agent,
  status,
}: {
  /** A run is going: the first view is the live browser, not the video. */
  live: boolean;
  /** Fills the space it is given; keeps its own shape inside it. */
  browser: ReactNode;
  agent: ReactNode;
  /** What the agent is on, shown beside the toggle. */
  status?: ReactNode;
}) {
  const view = useStageView((s) => s.view);
  const choose = useStageView((s) => s.set);
  const tabs: { id: StageView; label: string; icon: ReactNode }[] = [
    live
      ? { id: "browser", label: "Browser", icon: <GlobeIcon /> }
      : { id: "browser", label: "Video", icon: <PlayIcon /> },
    { id: "agent", label: "Agent", icon: <MessageSquareTextIcon /> },
  ];

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2">
      <div className="flex items-center gap-3">
        <div
          aria-label="What to show"
          className="inline-flex h-8 items-center rounded-lg bg-muted p-[3px]"
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              aria-selected={view === tab.id}
              className={cn(
                "inline-flex h-full items-center gap-1.5 rounded-md px-2.5 font-medium text-[13px] text-foreground/60 tracking-tight transition-all hover:text-foreground [&_svg]:size-3.5",
                view === tab.id && "bg-background text-foreground shadow-sm"
              )}
              key={tab.id}
              onClick={() => choose(tab.id)}
              role="tab"
              type="button"
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {status ? (
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2 truncate text-muted-foreground text-xs">
            {status}
          </div>
        ) : null}
      </div>
      {/* Both stay mounted: the player keeps its place, the frame keeps polling,
          and the thread keeps its scroll. */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          view !== "browser" && "hidden"
        )}
      >
        {browser}
      </div>
      {/* A thread gets better with height: it takes all there is. */}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden rounded-lg border bg-card",
          view !== "agent" && "hidden"
        )}
      >
        {agent}
      </div>
    </div>
  );
}
