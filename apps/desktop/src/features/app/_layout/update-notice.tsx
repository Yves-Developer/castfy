import { Button } from "@castfy/ui/components/button";
import { DownloadIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { bridge, type UpdateState } from "@/lib/bridge";

/** Why a restart has to wait, in the user's words. */
const BUSY: Record<string, string> = {
  recording: "Finish or stop the recording first.",
  exporting: "Wait for the export to finish first.",
};

/**
 * A small card in the corner once an update has downloaded: restart now, or
 * later (it then installs the next time Castfy quits). Nothing is shown while
 * it checks or downloads; that happens quietly in the background.
 */
export function UpdateNotice() {
  const [state, setState] = useState<UpdateState | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string | null>(null);

  useEffect(() => {
    // Older builds in development have no updater on the bridge.
    if (!bridge?.updateState) {
      return;
    }
    bridge.updateState().then(setState).catch(() => {});
    return bridge.onUpdateState((next) => {
      setState(next);
      setBlocked(null);
    });
  }, []);

  if (!state || state.status !== "ready" || dismissed === state.version) {
    return null;
  }

  const restart = async () => {
    const result = await bridge.installUpdate();
    if (!result.ok) {
      setBlocked(BUSY[result.reason ?? ""] ?? "Try again in a moment.");
    }
  };

  return (
    <div
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg"
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#0099ff] text-white">
          <DownloadIcon className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-sm">A new version is ready</p>
          <p className="text-muted-foreground text-xs leading-5">
            Castfy {state.version} installs when you restart. Later, it
            installs the next time you quit.
          </p>
        </div>
      </div>
      {blocked ? <p className="text-amber-500 text-xs">{blocked}</p> : null}
      <div className="flex justify-end gap-2">
        <Button
          onClick={() => setDismissed(state.version)}
          size="sm"
          variant="ghost"
        >
          Later
        </Button>
        <Button onClick={restart} size="sm">
          Restart to update
        </Button>
      </div>
    </div>
  );
}
