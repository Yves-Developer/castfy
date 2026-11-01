import { Button } from "@castfy/ui/components/button";
import { Textarea } from "@castfy/ui/components/textarea";
import { Loader2Icon, WandSparklesIcon } from "lucide-react";
import { forwardRef, useState } from "react";
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

/**
 * After a recording: ask the agent for a new take with something changed.
 * The agent records the whole flow again, keeping what worked in the last
 * take; swapping one step into the old video is not possible, because the
 * browser would have to be exactly where it was at that step.
 */
export const ChangeTake = forwardRef<
  HTMLTextAreaElement,
  {
    draft: string;
    onDraftChange: (draft: string) => void;
    onSubmit: (change: string) => Promise<void>;
  }
>(function ChangeTake({ draft, onDraftChange, onSubmit }, ref) {
  const [busy, setBusy] = useState(false);
  const change = draft.trim();

  const submit = async () => {
    if (!change || busy) {
      return;
    }
    setBusy(true);
    try {
      await onSubmit(change);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-2 rounded-xl border p-3"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="flex items-center gap-2">
        <WandSparklesIcon className="size-3.5 text-muted-foreground" />
        <p className="font-medium text-xs">Change something</p>
      </div>
      <Textarea
        className="min-h-16 resize-none text-xs"
        disabled={busy}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={(e) => {
          // ⌘/Ctrl+Enter sends, as in the agent prompt.
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="e.g. Slow down on the pricing page, and open the FAQ at the end"
        ref={ref}
        value={draft}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] text-muted-foreground">
          The agent records a new take. This one stays in your library.
        </p>
        <Button
          className="h-7 flex-none text-xs"
          disabled={busy || !change}
          size="sm"
          type="submit"
          variant="brand"
        >
          {busy ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
          Re-record
        </Button>
      </div>
    </form>
  );
});
