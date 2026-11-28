import { Button } from "@castfy/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@castfy/ui/components/input-group";
import { cn } from "@castfy/ui/lib/utils";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import {
  forwardRef,
  type KeyboardEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import { bridge } from "@/lib/bridge";

/**
 * The URL and goal a project was last recorded with: from the run log, or,
 * for a recording made outside the app (straight from Claude Code), from the
 * recording itself, whose steps then tell the agent what the demo does.
 */
export async function lastRunFor(
  projectId: string | undefined
): Promise<{ url: string; goal: string } | null> {
  if (!projectId) {
    return null;
  }
  const [project, runs] = await Promise.all([
    bridge.project(projectId).catch(() => null),
    bridge.runs().catch(() => []),
  ]);
  const sessionId = project?.sessionId;
  // Newest first: the run that made the current recording, else the latest
  // run started from this project.
  const run =
    runs.find((r) => sessionId && r.sessionIds.includes(sessionId)) ??
    runs.find((r) => (r as { projectId?: string }).projectId === projectId);
  if (run?.url) {
    return { url: run.url, goal: run.goal };
  }
  const session = project?.session;
  if (session?.startUrl) {
    return {
      url: session.startUrl,
      goal: `The same demo as the last take: ${session.title || project?.title}`,
    };
  }
  return null;
}

/** A step as the @ list offers it. */
export interface StepRef {
  label: string;
  description: string;
}

/** "@3", typed or picked: a reference to step 3. */
const STEP_REF = /@(\d+)\b/g;
/** An @ being typed right before the caret: "@", "@1", "@sign". */
const OPEN_REF = /(?:^|\s)@([^\s@]*)$/;
/** The @ word right before the caret, replaced when a step is picked. */
const TRAILING_REF = /@[^\s@]*$/;

/**
 * The change as the agent reads it: each "@3" spelled out as the step it
 * means, so the agent does not have to count.
 */
export function expandStepRefs(text: string, steps: StepRef[]): string {
  return text.replace(STEP_REF, (whole, n: string) => {
    const step = steps[Number(n) - 1];
    return step ? `step ${n} (${step.label}: ${step.description})` : whole;
  });
}

/**
 * After a recording: ask the agent for a new take with something changed.
 * The agent records the whole flow again, keeping what worked in the last
 * take; swapping one step into the old video is not possible, because the
 * browser would have to be exactly where it was at that step.
 *
 * The same prompt box as the first recording, with the agent and voice
 * pickers under it. Typing @ lists the steps; picking one writes "@3".
 */
export const ChangeTake = forwardRef<
  HTMLTextAreaElement,
  {
    draft: string;
    onDraftChange: (draft: string) => void;
    onSubmit: (change: string) => Promise<void>;
    steps: StepRef[];
    /** The agent, model and voice pickers, as under the first prompt. */
    tools?: ReactNode;
  }
>(function ChangeTake({ draft, onDraftChange, onSubmit, steps, tools }, ref) {
  const [busy, setBusy] = useState(false);
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const [closedAt, setClosedAt] = useState<number | null>(null);
  const own = useRef<HTMLTextAreaElement>(null);
  const change = draft.trim();

  // The @ being typed, and the steps it could mean.
  const open = OPEN_REF.exec(draft.slice(0, caret));
  const query = open?.[1]?.toLowerCase() ?? "";
  const matches = open
    ? steps
        .map((step, i) => ({ ...step, n: i + 1 }))
        .filter(
          (s) =>
            !query ||
            String(s.n).startsWith(query) ||
            `${s.label} ${s.description}`.toLowerCase().includes(query)
        )
        .slice(0, 8)
    : [];
  const listOpen = matches.length > 0 && closedAt !== caret;

  const setRefs = (el: HTMLTextAreaElement | null) => {
    own.current = el;
    if (typeof ref === "function") {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };

  const pick = (n: number) => {
    const before = draft.slice(0, caret).replace(TRAILING_REF, `@${n} `);
    const next = before + draft.slice(caret);
    onDraftChange(next);
    setActive(0);
    requestAnimationFrame(() => {
      own.current?.focus();
      own.current?.setSelectionRange(before.length, before.length);
      setCaret(before.length);
    });
  };

  /** Moves through, picks from or closes the @ list; true when the key was its. */
  const listKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((a) => (a + step + matches.length) % matches.length);
      return true;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      pick(matches[active]?.n ?? matches[0].n);
      return true;
    }
    if (e.key === "Escape") {
      setClosedAt(caret);
      return true;
    }
    return false;
  };

  const submit = async () => {
    if (!change || busy) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit(expandStepRefs(change, steps));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="relative"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {listOpen ? (
        <div
          className="absolute right-0 bottom-full left-0 z-20 mb-1.5 max-h-60 overflow-y-auto rounded-lg border bg-popover p-1 shadow-md"
          role="listbox"
        >
          <p className="px-2 pt-1 pb-1.5 text-[11px] text-muted-foreground">
            Pick a step
          </p>
          {matches.map((s, i) => (
            <button
              aria-selected={i === active}
              className={cn(
                "flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-xs",
                i === active
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
              key={s.n}
              onMouseDown={(e) => {
                // Before the textarea blurs, so the caret is still known.
                e.preventDefault();
                pick(s.n);
              }}
              role="option"
              type="button"
            >
              <span className="w-6 flex-none font-mono text-muted-foreground tabular-nums">
                @{s.n}
              </span>
              <span className="flex-none font-medium">{s.label}</span>
              <span className="min-w-0 truncate text-muted-foreground">
                {s.description}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <InputGroup>
        <InputGroupTextarea
          className="resize-none text-xs"
          disabled={busy}
          onChange={(e) => {
            onDraftChange(e.target.value);
            setCaret(e.target.selectionStart);
            setClosedAt(null);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (listOpen && listKey(e)) {
              e.preventDefault();
              return;
            }
            // Enter sends, Shift+Enter is a new line, as in the first prompt.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          placeholder="Change something and re-record… type @ to pick a step"
          ref={setRefs}
          rows={3}
          value={draft}
        />
        <InputGroupAddon
          align="block-end"
          className="flex justify-between border-foreground/10 border-t"
        >
          <div className="flex min-w-0 items-center gap-3">{tools}</div>
          <Button
            aria-label="Re-record with this change"
            className="rounded-full"
            disabled={busy || !change}
            size="icon-xs"
            type="submit"
            variant="brand"
          >
            {busy ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ArrowUpIcon strokeWidth={2.7} />
            )}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
        The agent records a new take. This one stays in your library.
      </p>
    </form>
  );
});
