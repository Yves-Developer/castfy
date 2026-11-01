import { cn } from "@castfy/ui/lib/utils";
import {
  ArrowUpDown,
  CameraIcon,
  CheckIcon,
  ChevronDown,
  CircleAlertIcon,
  Clock3Icon,
  Globe,
  Keyboard,
  Loader2Icon,
  MousePointer,
  Move,
  PanelTopIcon,
  ScissorsIcon,
  ShieldCheck,
  Type,
  UploadIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import type { AgentStep, PackagingStage } from "@/types";

const ICON = "size-3.5";

/** How each castfy0 action reads in the timeline, and the icon beside it. */
const ACTIONS: Record<string, { label: string; icon: ReactNode }> = {
  navigate: { label: "Open page", icon: <Globe className={ICON} /> },
  click: { label: "Click", icon: <MousePointer className={ICON} /> },
  fill: { label: "Type", icon: <Keyboard className={ICON} /> },
  select: { label: "Choose", icon: <ChevronDown className={ICON} /> },
  hover: { label: "Hover", icon: <Move className={ICON} /> },
  scroll: { label: "Scroll", icon: <ArrowUpDown className={ICON} /> },
  presskey: { label: "Press key", icon: <Type className={ICON} /> },
  press_key: { label: "Press key", icon: <Type className={ICON} /> },
  drag: { label: "Drag", icon: <Move className={ICON} /> },
  upload: { label: "Upload", icon: <UploadIcon className={ICON} /> },
  wait: { label: "Wait", icon: <Clock3Icon className={ICON} /> },
  assert: { label: "Check", icon: <ShieldCheck className={ICON} /> },
  screenshot: { label: "Screenshot", icon: <CameraIcon className={ICON} /> },
  newtab: { label: "New tab", icon: <PanelTopIcon className={ICON} /> },
  switchtab: { label: "Switch tab", icon: <PanelTopIcon className={ICON} /> },
  closetab: { label: "Close tab", icon: <PanelTopIcon className={ICON} /> },
};

export function describeAction(action: string) {
  const known = ACTIONS[action.toLowerCase()];
  if (known) {
    return known;
  }
  // Unknown actions still read as words: "markRetake" -> "Mark retake".
  const words = action.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ");
  return {
    label: words.charAt(0).toUpperCase() + words.slice(1).toLowerCase(),
    icon: <Globe className={ICON} />,
  };
}

/** "+0:42" since the first step, so a slow stretch of the run is visible. */
function elapsedLabel(
  t: string | undefined,
  startedAt: number | null
): string | null {
  if (!(t && startedAt)) {
    return null;
  }
  const seconds = Math.max(0, Math.round((Date.parse(t) - startedAt) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `+${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function StepRow({
  step,
  latest,
  startedAt,
  onChange,
}: {
  step: AgentStep;
  latest: boolean;
  startedAt: number | null;
  /** Asks for this step to change in a new take; absent while recording. */
  onChange?: () => void;
}) {
  const { label, icon } = describeAction(step.action);
  const failed = step.status === "error";
  const elapsed = elapsedLabel(step.t, startedAt);

  return (
    <li className="group relative flex gap-3 pb-3 last:pb-0">
      <span
        className={cn(
          "relative z-10 flex size-6 flex-none items-center justify-center rounded-md border bg-background text-muted-foreground",
          latest && "border-primary/60 text-foreground",
          failed && "border-destructive/60 text-destructive"
        )}
      >
        {icon}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground text-xs">{label}</span>
          {step.excluded ? (
            <span className="flex items-center gap-1 rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
              <ScissorsIcon className="size-2.5" />
              Cut
            </span>
          ) : null}
          {elapsed ? (
            <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">
              {elapsed}
            </span>
          ) : null}
          {onChange ? (
            <button
              className={cn(
                "text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100",
                !elapsed && "ml-auto"
              )}
              onClick={onChange}
              type="button"
            >
              Change
            </button>
          ) : null}
        </div>
        <p
          className={cn(
            "mt-0.5 text-muted-foreground text-xs leading-relaxed",
            step.excluded && "line-through decoration-muted-foreground/50"
          )}
        >
          {step.description}
        </p>
        {failed && step.error ? (
          <p className="mt-1 flex items-start gap-1.5 text-destructive text-xs">
            <CircleAlertIcon className="mt-0.5 size-3 flex-none" />
            <span className="break-words">{step.error}</span>
          </p>
        ) : null}
      </div>
    </li>
  );
}

/**
 * What the agent has done so far, as it happens.
 *
 * Steps arrive from castfy0's progress file one by one; the newest is
 * highlighted, and while the run is live a final row says the agent is on the
 * next one, so a long think does not look like a hang.
 */
export function StepsTimeline({
  steps,
  live = false,
  onChangeStep,
}: {
  steps: AgentStep[];
  live?: boolean;
  /** Offers "Change" on each step of a finished recording. */
  onChangeStep?: (index: number, step: AgentStep) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const startedAt = steps[0]?.t ? Date.parse(steps[0].t) : null;

  // Follow the newest step, as a log would.
  useEffect(() => {
    if (steps.length > 0) {
      endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [steps.length]);

  return (
    <section className="space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="font-medium text-xs">Agent actions</h3>
        {steps.length > 0 ? (
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {steps.length} {steps.length === 1 ? "step" : "steps"}
          </span>
        ) : null}
      </header>

      {steps.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-4 text-muted-foreground text-xs">
          {live ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          {live ? "Opening the browser…" : "No actions recorded."}
        </div>
      ) : (
        <ol className="relative before:absolute before:top-3 before:bottom-3 before:left-3 before:w-px before:bg-border">
          {steps.map((step, index) => (
            <StepRow
              key={step.id ?? `${step.action}-${index}`}
              latest={live && index === steps.length - 1}
              onChange={
                onChangeStep && !live
                  ? () => onChangeStep(index, step)
                  : undefined
              }
              startedAt={startedAt}
              step={step}
            />
          ))}
          {live ? (
            <li className="relative flex items-center gap-3 pt-3">
              <span className="relative z-10 flex size-6 flex-none items-center justify-center rounded-md border border-dashed bg-background">
                <Loader2Icon className="size-3 animate-spin text-muted-foreground" />
              </span>
              <span className="text-muted-foreground text-xs">
                Working on the next step…
              </span>
            </li>
          ) : null}
        </ol>
      )}
      <div ref={endRef} />
    </section>
  );
}

/**
 * Packaging at castfy0_end, stage by stage.
 *
 * Every stage before the newest is done; the newest is running until the run
 * finishes. Rendering the clean cut and the voiceover are the slow ones, and
 * seeing which is running is what tells a user it has not stalled.
 */
export function PackagingProgress({
  stages,
  finished,
}: {
  stages: PackagingStage[];
  finished: boolean;
}) {
  if (stages.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <h3 className="font-medium text-xs">
        {finished ? "Video ready" : "Preparing your video"}
      </h3>
      <ol className="space-y-2">
        {stages.map((stage, index) => {
          const done = finished || index < stages.length - 1;
          return (
            <li className="flex items-center gap-2 text-xs" key={stage.key}>
              {done ? (
                <CheckIcon className="size-3.5 text-primary" />
              ) : (
                <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
              )}
              <span
                className={done ? "text-muted-foreground" : "text-foreground"}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
