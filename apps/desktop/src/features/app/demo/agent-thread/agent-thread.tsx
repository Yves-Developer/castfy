import { cn } from "@castfy/ui/lib/utils";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  EyeIcon,
  FileTextIcon,
  FlagIcon,
  GlobeIcon,
  ListTodoIcon,
  Loader2Icon,
  MessageCircleQuestionIcon,
  MicIcon,
  RotateCcwIcon,
  ScissorsIcon,
  SearchIcon,
  ShieldCheckIcon,
  SquareTerminalIcon,
  VideoIcon,
  WrenchIcon,
  XIcon,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@castfy/ui/components/tooltip";
import { TOOL, ToolTile } from "@/components/brand";
import { describeAction, readableError } from "../sidebar/agent/step";
import type { AgentEvent } from "./types";

type ToolEvent = Extract<AgentEvent, { kind: "tool" }>;

const ICON = "size-3";

/** castfy0's tools that are not page actions, and how they read. */
const CASTFY0: Record<
  string,
  { label: string; icon: ReactNode; color: string }
> = {
  start: {
    label: "Start recording",
    icon: <VideoIcon className={ICON} />,
    color: TOOL.agent,
  },
  end: {
    label: "Finish recording",
    icon: <FlagIcon className={ICON} />,
    color: TOOL.agent,
  },
  snapshot: {
    label: "Look at the page",
    icon: <EyeIcon className={ICON} />,
    color: TOOL.neutral,
  },
  look: {
    label: "Look at the page",
    icon: <EyeIcon className={ICON} />,
    color: TOOL.neutral,
  },
  status: {
    label: "Check recording",
    icon: <ShieldCheckIcon className={ICON} />,
    color: TOOL.neutral,
  },
  narration_plan: {
    label: "Plan narration",
    icon: <MicIcon className={ICON} />,
    color: TOOL.voice,
  },
  set_narration: {
    label: "Write narration",
    icon: <MicIcon className={ICON} />,
    color: TOOL.voice,
  },
  ask_user: {
    label: "Ask you",
    icon: <MessageCircleQuestionIcon className={ICON} />,
    color: TOOL.click,
  },
  authenticate: {
    label: "Sign in",
    icon: <ShieldCheckIcon className={ICON} />,
    color: TOOL.page,
  },
  exclude_step: {
    label: "Cut a step",
    icon: <ScissorsIcon className={ICON} />,
    color: TOOL.neutral,
  },
  mark_retake: {
    label: "Retake",
    icon: <RotateCcwIcon className={ICON} />,
    color: TOOL.neutral,
  },
  think_start: {
    label: "Pause to think",
    icon: <Loader2Icon className={ICON} />,
    color: TOOL.neutral,
  },
  think_end: {
    label: "Back to recording",
    icon: <VideoIcon className={ICON} />,
    color: TOOL.neutral,
  },
};

/** The agent's own tools (reading files, running commands). */
const BUILTIN: Record<string, { label: string; icon: ReactNode }> = {
  read: { label: "Read file", icon: <FileTextIcon className={ICON} /> },
  bash: { label: "Run command", icon: <SquareTerminalIcon className={ICON} /> },
  grep: { label: "Search", icon: <SearchIcon className={ICON} /> },
  glob: { label: "Find files", icon: <SearchIcon className={ICON} /> },
  webfetch: { label: "Fetch page", icon: <GlobeIcon className={ICON} /> },
  websearch: { label: "Search the web", icon: <SearchIcon className={ICON} /> },
  todowrite: { label: "Update plan", icon: <ListTodoIcon className={ICON} /> },
  toolsearch: { label: "Load tools", icon: <WrenchIcon className={ICON} /> },
};

function describeTool(name: string) {
  if (name.startsWith("castfy0_")) {
    const action = name.slice("castfy0_".length);
    const own = CASTFY0[action];
    if (own) {
      return own;
    }
    const step = describeAction(action);
    return {
      ...step,
      icon: <span className="[&_svg]:size-3">{step.icon}</span>,
    };
  }
  const builtin = BUILTIN[name.toLowerCase()];
  return {
    label: builtin?.label ?? name,
    icon: builtin?.icon ?? <WrenchIcon className={ICON} />,
    color: TOOL.neutral,
  };
}

/** The one argument that says what a call was about. */
const SUMMARY_KEYS = [
  "description",
  "text",
  "question",
  "url",
  "selector",
  "value",
  "key",
  "file_path",
  "command",
  "pattern",
  "query",
];

/** "mcp__castfy0__castfy0_start" → "start", for lists of tool names. */
const TOOL_PREFIX = /mcp__[a-z0-9_-]+?__(castfy0_)?/gi;

function summarize(input: Record<string, unknown>): string | null {
  // Loading tools: which ones, in plain words.
  if (typeof input.query === "string" && input.query.startsWith("select:")) {
    return input.query
      .slice("select:".length)
      .replace(TOOL_PREFIX, "")
      .replaceAll(",", ", ");
  }
  // What was typed is the point of a Type step.
  if (
    typeof input.value === "string" &&
    typeof input.description === "string"
  ) {
    return `${input.description.trim()} “${input.value}”`;
  }
  for (const key of SUMMARY_KEYS) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim().split("\n")[0] ?? null;
    }
  }
  return null;
}

function seconds(ms: number): string {
  if (ms < 1000) {
    return `${Math.max(0.1, ms / 1000).toFixed(1)}s`;
  }
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function compact(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`;
  }
  return String(n);
}

function ToolRow({
  event,
  highlighted,
  rowRef,
}: {
  event: ToolEvent;
  highlighted: boolean;
  rowRef?: (el: HTMLDivElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const { label, icon, color } = describeTool(event.name);
  const summary = summarize(event.input);
  const failed = event.status === "error";
  const took = event.endedAt ? seconds(event.endedAt - event.t) : null;

  return (
    <div
      className={cn(
        "rounded-lg transition-colors",
        highlighted && "bg-[#0099ff]/[0.07] ring-1 ring-[#0099ff]/40"
      )}
      ref={rowRef}
    >
      <button
        aria-expanded={open}
        className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-muted/70"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <ToolTile
          className="size-5 rounded-[5px] dark:ring-1 dark:ring-white/10"
          color={failed ? "bg-destructive" : color}
        >
          {icon}
        </ToolTile>
        <span className="flex-none font-medium text-foreground text-xs">
          {label}
        </span>
        {summary ? (
          <span className="min-w-0 flex-1 truncate text-muted-foreground text-xs">
            {summary}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        {took ? (
          <span className="flex-none text-[11px] text-muted-foreground tabular-nums">
            {took}
          </span>
        ) : null}
        <span className="grid size-4 flex-none place-items-center">
          {event.status === "running" ? (
            <Loader2Icon className="size-3.5 animate-spin text-muted-foreground" />
          ) : failed ? (
            <XIcon className="size-3.5 text-destructive" />
          ) : (
            <CheckIcon className="size-3.5 text-muted-foreground/70" />
          )}
        </span>
        <ChevronRightIcon
          className={cn(
            "size-3.5 flex-none text-muted-foreground/60 transition-transform group-hover:text-muted-foreground",
            open && "rotate-90"
          )}
        />
      </button>
      {failed && event.output && !open ? (
        <p className="flex items-start gap-1.5 pr-2 pb-1.5 pl-9 text-destructive text-xs">
          <span className="line-clamp-2 break-words">
            {readableError(event.output)}
          </span>
        </p>
      ) : null}
      {open ? (
        <div className="mx-2 mb-2 ml-9 space-y-2 rounded-md border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed">
          <Detail label="Input" text={JSON.stringify(event.input, null, 2)} />
          {event.output ? (
            <Detail
              label={failed ? "Error" : "Result"}
              text={event.output}
              tone={failed ? "error" : undefined}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Detail({
  label,
  text,
  tone,
}: {
  label: string;
  text: string;
  tone?: "error";
}) {
  return (
    <div>
      <p className="mb-1 font-medium font-sans text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <pre
        className={cn(
          "max-h-48 overflow-auto whitespace-pre-wrap break-words text-foreground/85",
          tone === "error" && "text-destructive"
        )}
      >
        {text}
      </pre>
    </div>
  );
}

function resetTime(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const MODEL_ID = /(opus|sonnet|haiku|fable)-(\d+)-(\d+)/i;

/** "claude-sonnet-5-5" → "Sonnet 5.5". */
function modelName(id: string): string {
  const m = id.match(MODEL_ID);
  if (!m) {
    return id;
  }
  const [, family = "", major, minor] = m;
  return `${family.charAt(0).toUpperCase()}${family.slice(1)} ${major}.${minor}`;
}

type Limit = NonNullable<Extract<AgentEvent, { kind: "done" }>["limit"]>;

/** Left of the limit: plenty, getting low, nearly gone. */
function leftTone(left: number) {
  if (left < 0.15) {
    return {
      bar: "bg-[#e5484d]/25",
      dot: "bg-[#e5484d]",
      text: "text-[#e5484d]",
    };
  }
  if (left < 0.4) {
    return {
      bar: "bg-[#e08a1e]/25",
      dot: "bg-[#e08a1e]",
      text: "text-[#e08a1e]",
    };
  }
  return {
    bar: "bg-[#1f9d6b]/20",
    dot: "bg-[#1f9d6b]",
    text: "text-[#1f9d6b]",
  };
}

/** Whole percents; a sliver of use reads "<1%", not "0%". */
const pct = (n: number) =>
  n > 0 && n < 0.005 ? "<1%" : `${Math.round(n * 100)}%`;
/** This run's share: the limit is reported in whole percents, so 0 means under 1%. */
const runPct = (n: number) => (n < 0.005 ? "<1%" : pct(n));

/**
 * A Claude subscription's 5-hour limit in three parts: what was already used
 * before this run, what this run used, and what is left.
 */
function LimitMeter({ limit }: { limit: Limit }) {
  const run = Math.min(limit.used, limit.now);
  const before = Math.max(0, limit.now - run);
  const left = Math.max(0, 1 - limit.now);
  const tone = leftTone(left);
  const parts = [
    {
      key: "before",
      label: "Before this run",
      value: before,
      bar: "bg-[#7c5cff]",
      dot: "bg-[#7c5cff]",
    },
    {
      key: "run",
      label: "This demo",
      value: run,
      bar: "bg-[#0099ff]",
      dot: "bg-[#0099ff]",
    },
    { key: "left", label: "Left", value: left, bar: tone.bar, dot: tone.dot },
  ];
  return (
    <div className="rounded-lg border px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-foreground">
          This demo used{" "}
          <span className="font-semibold text-[#0099ff] tabular-nums">
            {runPct(run)}
          </span>{" "}
          of your 5-hour limit
        </span>
        <span className="text-[11px]">resets {resetTime(limit.resetsAt)}</span>
      </div>
      <div className="mt-2.5 flex h-2 gap-0.5">
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <span
              className={cn("h-full rounded-full first:rounded-l-full", p.bar)}
              key={p.key}
              style={{ width: `${p.value * 100}%` }}
            />
          ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {parts.map((p) => (
          <span className="inline-flex items-center gap-1.5" key={p.key}>
            <span className={cn("size-2 rounded-full", p.dot)} />
            {p.label}
            <span
              className={cn(
                "font-medium text-foreground tabular-nums",
                p.key === "left" && tone.text
              )}
            >
              {p.key === "run" ? runPct(p.value) : pct(p.value)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * How the run ended and what it used: turns, time, tokens, the agent's own
 * price, and how much of a Claude subscription's 5-hour limit went on it.
 */
function RunSummary({
  event,
  className,
}: {
  event: Extract<AgentEvent, { kind: "done" }>;
  className?: string;
}) {
  const parts = [
    event.model ? modelName(event.model) : null,
    event.turns ? `${event.turns} turns` : null,
    event.durationMs ? seconds(event.durationMs) : null,
    event.tokens ? `${compact(event.tokens)} tokens` : null,
  ].filter(Boolean);
  const limit = event.limit;
  return (
    <div
      className={cn(
        "space-y-2.5 border-t pt-3 text-muted-foreground text-xs",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {event.isError ? (
          <CircleAlertIcon className="size-3.5 text-destructive" />
        ) : (
          <CircleCheckIcon className="size-3.5 text-[#1f9d6b]" />
        )}
        <span className="font-medium text-foreground">
          {event.isError ? "Run stopped" : "Run finished"}
        </span>
        {parts.map((part) => (
          <span className="before:mr-2 before:content-['·']" key={part}>
            {part}
          </span>
        ))}
        {event.costUsd == null ? null : (
          <span className="flex items-center gap-2">
            <span>·</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help underline decoration-dotted underline-offset-2">
                  ≈ ${event.costUsd.toFixed(2)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-64">
                What your agent says this run would cost at API prices. On a
                Claude subscription you are not charged this: the run counts
                toward your plan's limits instead.
              </TooltipContent>
            </Tooltip>
          </span>
        )}
      </div>
      {limit ? <LimitMeter limit={limit} /> : null}
    </div>
  );
}

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`)/g;

/**
 * The little markdown agents write in their messages: **bold** and `code`,
 * and "- " lists. Everything else stays text; nothing is ever HTML.
 */
function Prose({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const bullet = line.startsWith("- ");
        const body = bullet ? line.slice(2) : line;
        const parts = body.split(INLINE).map((part, k) => {
          if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
              <strong className="font-semibold" key={k}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (
              <code
                className="break-all rounded bg-muted px-1 py-px font-mono text-[12px]"
                key={k}
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          return part;
        });
        return (
          <span className={cn("block", bullet && "pl-4 -indent-3")} key={i}>
            {bullet ? "• " : null}
            {parts}
            {line === "" ? "\u00a0" : null}
          </span>
        );
      })}
    </>
  );
}

/**
 * The agent's run as a conversation: what it said, and every tool it called,
 * as it happens. Tool rows open to show their arguments and results.
 */
export function AgentThread({
  events,
  live = false,
  highlightId,
  composer,
  emptyText,
  className,
}: {
  events: AgentEvent[];
  live?: boolean;
  /** A tool call to scroll to and mark, chosen from the steps on the left. */
  highlightId?: string | null;
  /** The prompt box, pinned under the thread as in a chat. */
  composer?: ReactNode;
  /** Said when there is nothing to show and no run going. */
  emptyText?: string;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const rows = useRef(new Map<string, HTMLDivElement>());
  const [following, setFollowing] = useState(true);
  const followingRef = useRef(true);
  followingRef.current = following;

  // Follow the newest event, until the user scrolls up to read.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new event is the reason to scroll
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && following) {
      el.scrollTop = el.scrollHeight;
    }
  }, [events, following]);

  // The prompt box under the thread changes height (a run starts or ends):
  // stay at the bottom through it.
  useEffect(() => {
    const el = scroller.current;
    if (!(el && following)) {
      return;
    }
    const observer = new ResizeObserver(() => {
      // A jump to a step (below) turns following off before this can fire.
      if (followingRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [following]);

  useEffect(() => {
    if (!highlightId) {
      return;
    }
    followingRef.current = false;
    setFollowing(false);
    // After the view has been shown and laid out.
    const frame = requestAnimationFrame(() =>
      rows.current.get(highlightId)?.scrollIntoView({ block: "center" })
    );
    return () => cancelAnimationFrame(frame);
  }, [highlightId]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) {
      setFollowing(el.scrollHeight - el.scrollTop - el.clientHeight < 24);
    }
  };

  const last = events.at(-1);
  const finished = last?.kind === "done";
  const working = live && !finished && last?.kind !== "tool";

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="relative min-h-0 flex-1">
        <div
          className="h-full overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_20px,black_calc(100%-12px),transparent)]"
          onScroll={onScroll}
          ref={scroller}
        >
          <div className="mx-auto flex max-w-2xl flex-col px-5 py-5">
            {events.length === 0 ? (
              <p className="py-16 text-center text-muted-foreground text-xs">
                {live || !emptyText
                  ? "The agent's messages and tool calls show here as it works."
                  : emptyText}
              </p>
            ) : null}
            {events.map((event, i) => {
              const prev = events[i - 1];
              // Tool calls in a row sit close together; anything else gets air.
              const gap =
                i === 0
                  ? ""
                  : prev?.kind === "tool" && event.kind === "tool"
                    ? "mt-0.5"
                    : "mt-4";
              switch (event.kind) {
                case "prompt":
                  return (
                    <div
                      className={cn("flex flex-col items-end gap-1.5", gap)}
                      key={event.id}
                    >
                      <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-muted px-3.5 py-2.5 text-[13px] text-foreground leading-relaxed">
                        {event.text}
                      </div>
                      {event.url ? (
                        <span className="inline-flex max-w-[85%] items-center gap-1 truncate rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                          <GlobeIcon className="size-3 flex-none" />
                          {event.url}
                        </span>
                      ) : null}
                    </div>
                  );
                case "text":
                  return (
                    <p
                      className={cn(
                        "break-words px-2 text-[13px] text-foreground leading-6",
                        gap
                      )}
                      key={event.id}
                    >
                      <Prose text={event.text} />
                    </p>
                  );
                case "tool":
                  return (
                    <div className={gap} key={event.id}>
                      <ToolRow
                        event={event}
                        highlighted={event.id === highlightId}
                        rowRef={(el) => {
                          if (el) {
                            rows.current.set(event.id, el);
                          } else {
                            rows.current.delete(event.id);
                          }
                        }}
                      />
                    </div>
                  );
                case "error":
                  return (
                    <p
                      className={cn(
                        "flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive text-xs",
                        gap
                      )}
                      key={event.id}
                    >
                      <CircleAlertIcon className="mt-0.5 size-3.5 flex-none" />
                      <span className="break-words">
                        {readableError(event.text)}
                      </span>
                    </p>
                  );
                case "done":
                  return (
                    <RunSummary className={gap} event={event} key={event.id} />
                  );
                default:
                  return null;
              }
            })}
            {working ? (
              <p className="mt-4 flex items-center gap-2 px-2 text-muted-foreground text-xs">
                <span className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                </span>
                Thinking
              </p>
            ) : null}
          </div>
        </div>
        {!following && live ? (
          <button
            className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border bg-background px-3 py-1 text-[11px] text-foreground shadow-sm hover:bg-muted"
            onClick={() => setFollowing(true)}
            type="button"
          >
            <ArrowDownIcon className="size-3" />
            Latest
          </button>
        ) : null}
      </div>
      {composer ? (
        <div className="mx-auto w-full max-w-2xl flex-none px-5 pb-4">
          {composer}
        </div>
      ) : null}
    </div>
  );
}
