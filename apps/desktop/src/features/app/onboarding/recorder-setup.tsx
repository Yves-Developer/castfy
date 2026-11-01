"use client";
import { Button } from "@castfy/ui/components/button";
import { AlertCircleIcon, Loader2Icon, MonitorPlayIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SetupProgress } from "@/lib/bridge";
import { bridge } from "@/lib/bridge";

/**
 * First-run download of the browser Castfy records and exports with.
 *
 * Chromium is too large to ship in the installer, so it arrives here instead,
 * once. The download starts on its own — there is no decision to make, and a
 * button would only be one more thing between installing and recording.
 */
export function RecorderSetup({ onReady }: { onReady: () => void }) {
  const [progress, setProgress] = useState<SetupProgress>({
    percent: 0,
    label: "Preparing download…",
  });
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  /** Guards the automatic start against React running effects twice. */
  const started = useRef(false);

  const install = useCallback(async () => {
    setError(null);
    setRunning(true);
    try {
      const result = await bridge.installBrowsers();
      if (result.ok) {
        onReady();
        return;
      }
      setError(result.error ?? "The download failed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }, [onReady]);

  useEffect(() => bridge.onSetupProgress(setProgress), []);

  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    install();
  }, [install]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="flex w-full max-w-100 flex-col items-center gap-6 text-center">
        <span className="flex size-11 items-center justify-center rounded-xl bg-secondary">
          <MonitorPlayIcon className="size-5.5" />
        </span>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-medium text-lg">Setting up the recorder</h1>
          <p className="text-balance text-muted-foreground text-sm">
            Castfy records in its own copy of Chromium. It downloads once (about
            150&nbsp;MB) and is reused for every recording and export.
          </p>
        </div>

        {error ? (
          <div className="flex w-full flex-col items-center gap-3">
            <p className="flex items-start gap-2 text-left text-destructive text-xs">
              <AlertCircleIcon className="mt-0.5 size-3.5 flex-none" />
              <span>{error}</span>
            </p>
            <Button disabled={running} onClick={install} size="sm" variant="brand">
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2">
            <div
              aria-label="Download progress"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={progress.percent}
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Loader2Icon className="size-3 animate-spin" />
                {progress.label}
              </span>
              <span className="tabular-nums">{progress.percent}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
