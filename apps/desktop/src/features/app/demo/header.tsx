"use client";
import { Button } from "@castfy/ui/components/button";
import { CheckIcon, FolderOpenIcon, Loader2Icon } from "lucide-react";
import { bridge } from "@/lib/bridge";
import { DemoDropMenu } from "./menu";
import { useExport } from "./use-export";
import { useStudioProject } from "./use-project";

export default function DemoHeader() {
  const { project } = useStudioProject();
  const exporter = useExport(project?.sessionId);

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
              onClick={() => bridge.reveal(exporter.outputPath as string)}
              size="sm"
              variant="secondary"
            >
              <CheckIcon className="size-3.5" />
              Exported
              <FolderOpenIcon className="size-3.5" />
            </Button>
          ) : (
            <Button disabled size={"sm"} variant={"secondary"}>
              Save
            </Button>
          )}

          <Button
            className="gap-1.5"
            disabled={!canExport || exporter.busy}
            onClick={exporter.run}
            size="sm"
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
    </header>
  );
}
