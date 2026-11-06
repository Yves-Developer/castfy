"use client";
import { FREE_DEMO_LIMIT } from "@castfy/plans";
import { Button } from "@castfy/ui/components/button";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { UpgradeDialog } from "@/features/app/billing/upgrade-dialog";
import { RUN_LIMIT_EVENT } from "@/lib/local-query";
import { DemoDropMenu } from "./menu";
import { useExport } from "./use-export";
import { useStudioProject } from "./use-project";

export default function DemoHeader() {
  const { project } = useStudioProject();
  const exporter = useExport(project?.sessionId, project?.title);

  /**
   * Export renders the recording on disk, so a finished video is the real
   * precondition. Status alone was too strict: it is derived from steps.json
   * existing, and a session whose file landed after this view mounted stayed
   * "recording" until something forced a refetch — leaving Export dead with
   * nothing on screen saying why.
   */
  const session = project?.session;
  const hasVideo = Boolean(
    session?.videos && Object.keys(session.videos).length > 0
  );
  const canExport = Boolean(
    project?.sessionId && (session?.status === "complete" || hasVideo)
  );

  /**
   * The export renders the finished cut on disk. Applying an edit rewrites that
   * file, so applied changes are included — but a pending one is not, and
   * exporting without saying so looks like the edit was ignored.
   */
  const pendingEdit = Array.isArray(project?.cuts);

  return (
    <header className="fixed top-0 z-10 flex h-12.75 w-full items-center border-b bg-background px-2.5">
      <div className="flex w-full items-center justify-between">
        <DemoDropMenu />

        <div className="flex items-center gap-2">
          <span className="font-medium text-muted-foreground text-xs">
            {project?.title ?? "Demo"}
          </span>
          {exporter.error ? (
            <span className="text-destructive text-xs">{exporter.error}</span>
          ) : pendingEdit ? (
            <span className="text-amber-500 text-xs">
              Apply your cut edit to include it in the export
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {exporter.outputPath ? (
            <Button
              className="gap-1.5"
              onClick={exporter.saveAs}
              size="sm"
              title={
                exporter.savedPath
                  ? `Last saved to ${exporter.savedPath}`
                  : "Save a copy of the exported video"
              }
              variant="secondary"
            >
              <DownloadIcon className="size-3.5" />
              Save as…
            </Button>
          ) : null}

          <Button
            className="gap-1.5"
            disabled={!canExport || exporter.busy}
            onClick={exporter.run}
            size="sm"
            variant="brand"
          >
            {exporter.busy ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                {exporter.status ?? "Exporting…"}
              </>
            ) : (
              "Export"
            )}
          </Button>
        </div>
      </div>
      <RunLimitDialog />
      <UpgradeDialog
        limit={exporter.limitReached}
        onClose={exporter.dismissLimit}
        onUnlocked={() => {
          exporter.dismissLimit();
          exporter.run();
        }}
      />
    </header>
  );
}

/**
 * The buy prompt for a run refused because the free demos are used up
 * (main.js recordingBlocked, or castfy0 itself). Unlocking only closes it:
 * the user runs again when ready.
 */
function RunLimitDialog() {
  const [limit, setLimit] = useState<number | null>(null);
  useEffect(() => {
    const onLimit = (event: Event) => {
      const value = (event as CustomEvent<number | null>).detail;
      setLimit(
        typeof value === "number" && value > 0 ? value : FREE_DEMO_LIMIT
      );
    };
    window.addEventListener(RUN_LIMIT_EVENT, onLimit);
    return () => window.removeEventListener(RUN_LIMIT_EVENT, onLimit);
  }, []);
  return (
    <UpgradeDialog
      limit={limit}
      onClose={() => setLimit(null)}
      onUnlocked={() => setLimit(null)}
    />
  );
}
