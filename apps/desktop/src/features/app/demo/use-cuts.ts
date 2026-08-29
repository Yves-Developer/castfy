import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CutRange, Project } from '@/lib/bridge';
import { bridge } from '@/lib/bridge';

/** A cut narrower than this is impossible to grab again once made. */
const MIN_CUT_MS = 120;

/** Editing is coarse; saving on every pixel of a drag is not. */
const SAVE_DEBOUNCE_MS = 400;

export interface CutsApi {
  cuts: CutRange[];
  /** True when the cuts differ from the video currently on disk. */
  edited: boolean;
  /** True when the current cuts are the engine's original. */
  isAiCut: boolean;
  busy: boolean;
  error: string | null;
  narrationStale: boolean;
  adjust(index: number, edge: 'start' | 'end', ms: number): void;
  remove(index: number): void;
  reset(): void;
  applyToVideo(): Promise<void>;
}

/** Clamps one edge without letting a cut invert or collapse. */
function moveEdge(cut: CutRange, edge: 'start' | 'end', ms: number, totalMs: number): CutRange {
  if (edge === 'start') {
    return { ...cut, startMs: Math.max(0, Math.min(ms, cut.endMs - MIN_CUT_MS)) };
  }
  return { ...cut, endMs: Math.min(totalMs, Math.max(ms, cut.startMs + MIN_CUT_MS)) };
}

/**
 * The user's edit of the engine's cuts.
 *
 * The engine's trim is a proposal. This holds the version being edited, keeps it
 * on the project so navigating away does not lose it, and only touches the video
 * on disk when the edit is applied — everything before that is previewed by
 * skipping ranges during playback, which costs nothing.
 */
export function useCuts(project: Project | null | undefined, slug: string | undefined): CutsApi {
  /** The engine's original proposal, and what Reset returns to. */
  const aiCuts = useMemo(() => project?.session?.timeline?.aiCuts ?? [], [project]);
  /** What the clean video on disk was rendered from. */
  const appliedCuts = useMemo(
    () => project?.session?.timeline?.appliedCuts ?? aiCuts,
    [project, aiCuts]
  );
  const totalMs = project?.session?.timeline?.totalDurationMs ?? 0;

  const [cuts, setCuts] = useState<CutRange[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrationStale, setNarrationStale] = useState(false);

  // Start from the pending edit, else from what the video on disk shows.
  useEffect(() => {
    setCuts(project?.cuts ?? appliedCuts);
    setError(null);
  }, [project?.cuts, appliedCuts]);

  /**
   * "Edited" means different from the rendered video, not from the AI's
   * proposal. That is what makes Apply meaningful — and it is why Reset to the
   * AI cut counts as an edit when a different one has already been applied.
   */
  const edited = useMemo(
    () => JSON.stringify(cuts) !== JSON.stringify(appliedCuts),
    [cuts, appliedCuts]
  );

  /** Whether the current cuts match the engine's original. */
  const isAiCut = useMemo(
    () => JSON.stringify(cuts) === JSON.stringify(aiCuts),
    [cuts, aiCuts]
  );

  // Persist the pending edit, debounced.
  useEffect(() => {
    if (!(slug && edited)) return;
    const timer = setTimeout(() => {
      bridge.saveCuts(slug, cuts).catch(() => {
        // Losing the pending edit is survivable; the video is untouched.
      });
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [slug, cuts, edited]);

  const adjust = useCallback(
    (index: number, edge: 'start' | 'end', ms: number) => {
      setCuts((prev) =>
        prev.map((cut, i) => (i === index ? moveEdge(cut, edge, ms, totalMs) : cut))
      );
    },
    [totalMs]
  );

  const remove = useCallback((index: number) => {
    setCuts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    setCuts(aiCuts);
    setError(null);
    if (!slug) return;
    // If the rendered video already is the AI cut there is nothing pending;
    // otherwise this is a real edit that still needs applying.
    const pending = JSON.stringify(aiCuts) === JSON.stringify(appliedCuts) ? null : aiCuts;
    bridge.saveCuts(slug, pending).catch(() => {
      // The in-memory reset already happened.
    });
  }, [aiCuts, appliedCuts, slug]);

  const applyToVideo = useCallback(async () => {
    const sessionId = project?.sessionId;
    if (!(sessionId && slug)) return;

    setBusy(true);
    setError(null);
    try {
      const result = await bridge.recut(sessionId, cuts);
      if (!result.ok) {
        setError(result.error ?? 'Could not apply the edit.');
        return;
      }
      setNarrationStale(Boolean(result.narrationStale));
      // Applied: the file on disk now matches, so there is no pending edit.
      await bridge.saveCuts(slug, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }, [project?.sessionId, slug, cuts]);

  return { cuts, edited, isAiCut, busy, error, narrationStale, adjust, remove, reset, applyToVideo };
}

/**
 * Where playback should jump to, if anywhere.
 *
 * This is what makes the edit previewable without rendering: the player runs the
 * raw footage and steps over cut ranges as it reaches them.
 */
export function nextPlayablePosition(ms: number, cuts: CutRange[]): number | null {
  for (const cut of cuts) {
    if (ms >= cut.startMs && ms < cut.endMs) return cut.endMs;
  }
  return null;
}
