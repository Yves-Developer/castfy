import { useCallback } from 'react';
import { create } from 'zustand';
import { bridge } from '@/lib/bridge';
import { getBackgroundStyle } from '@/lib/constants/backgrounds';
import { videoFrameSize } from '@/lib/frame-size';
import { getR2ImageUrl } from '@/lib/r2';
import { useBackgroundStore } from '@/lib/store';

/**
 * Renders the project as it looks in the studio.
 *
 * The background is resolved to CSS here rather than in the render bundle: the
 * gradient catalogue lives on this side, and passing the finished value keeps
 * one definition of what "magic:sunset" means instead of two.
 */
/** Where one recording's export is. */
interface ExportState {
  busy: boolean;
  error: string | null;
  /** The free demos are used up: set when an export was refused for it. */
  limitReached: number | null;
  outputPath: string | null;
  /** Where the user last saved a copy of the export. */
  savedPath: string | null;
  status: string | null;
}

const IDLE: ExportState = {
  busy: false,
  status: null,
  error: null,
  outputPath: null,
  savedPath: null,
  limitReached: null,
};

/**
 * Exports by recording, kept outside the studio's components. An export runs
 * on in the main process when the user goes back to the library; held in the
 * studio's own state, its progress was lost then, and coming back showed a
 * plain Export button while it still rendered, ready to start a second one.
 */
const useExports = create<{
  bySession: Record<string, ExportState>;
  patch: (sessionId: string, state: Partial<ExportState>) => void;
}>((set) => ({
  bySession: {},
  patch: (sessionId, state) =>
    set((s) => ({
      bySession: {
        ...s.bySession,
        [sessionId]: { ...(s.bySession[sessionId] ?? IDLE), ...state },
      },
    })),
}));

const patchExport = (sessionId: string, state: Partial<ExportState>) =>
  useExports.getState().patch(sessionId, state);

// Progress for any export, whichever page is open.
bridge.onExportProgress(({ sessionId, message }) => {
  if (useExports.getState().bySession[sessionId]?.busy) {
    patchExport(sessionId, { status: message ?? null });
  }
});

/** Whether a recording is exporting, and how far along: for the library too. */
export function useExportState(sessionId: string | null | undefined): ExportState {
  return useExports((s) => (sessionId ? s.bySession[sessionId] : undefined) ?? IDLE);
}

/**
 * Renders the project as it looks in the studio.
 *
 * The background is resolved to CSS here rather than in the render bundle: the
 * gradient catalogue lives on this side, and passing the finished value keeps
 * one definition of what "magic:sunset" means instead of two.
 */
export function useExport(sessionId: string | null | undefined, title?: string) {
  const {
    backgroundConfig,
    blurs,
    imageOverlays,
    selectedAspectRatio,
    customDimensions,
    frame,
    startUrl,
    zoomTrack,
  } = useBackgroundStore();
  const state = useExportState(sessionId);

  /**
   * Saves a copy of the export where the user picks. The export itself is
   * rewritten by every new export, so this is the copy that is kept.
   */
  const saveAs = useCallback(async () => {
    if (!sessionId) return;
    const saved = await bridge.saveExport(sessionId, title ?? 'Castfy demo');
    if (saved.ok && saved.path) patchExport(sessionId, { savedPath: saved.path });
    else if (saved.error) patchExport(sessionId, { error: saved.error });
  }, [sessionId, title]);

  const run = useCallback(async () => {
    if (!sessionId) return;
    // One export per recording: both would write the same file.
    if (useExports.getState().bySession[sessionId]?.busy) return;

    const { width, height } = videoFrameSize({
      selectedAspectRatio,
      customDimensions,
      frame,
      // The recorded page's shape; every recording so far is 16:9.
      videoAspect: zoomTrack
        ? zoomTrack.viewport.width / zoomTrack.viewport.height
        : 16 / 9,
    });

    const spec = {
      backgroundCss: getBackgroundStyle(backgroundConfig),
      // Only an image background needs a file brought across.
      backgroundImage:
        backgroundConfig.type === 'image' ? getR2ImageUrl({ src: backgroundConfig.value }) : null,
      overlays: imageOverlays
        .filter((o) => o.isVisible)
        .map((o) => ({
          src: o.src,
          x: o.position.x,
          y: o.position.y,
          size: o.size,
          rotation: o.rotation,
          opacity: o.opacity,
          flipX: o.flipX,
          flipY: o.flipY,
          blur: o.blur ?? 0,
          layer: o.layer ?? 'front',
        })),
      width,
      height,
      blurs,
      frame,
      address: startUrl,
    };

    patchExport(sessionId, {
      busy: true,
      error: null,
      limitReached: null,
      outputPath: null,
      status: 'Starting…',
    });
    try {
      const result = await bridge.render(sessionId, spec);
      if (result.ok) {
        patchExport(sessionId, { busy: false, status: null, outputPath: result.outputLocation ?? null });
        // An export is for sending somewhere: ask where it goes straight away.
        const saved = await bridge.saveExport(sessionId, title ?? 'Castfy demo');
        if (saved.ok && saved.path) patchExport(sessionId, { savedPath: saved.path });
      } else if (result.limitReached) {
        // Not an error: the app offers to buy instead.
        patchExport(sessionId, { limitReached: result.limit ?? 0 });
      } else patchExport(sessionId, { error: result.error ?? 'Export failed.' });
    } catch (err) {
      patchExport(sessionId, { error: err instanceof Error ? err.message : String(err) });
    } finally {
      patchExport(sessionId, { busy: false, status: null });
    }
  }, [sessionId, title, backgroundConfig, blurs, imageOverlays, selectedAspectRatio, customDimensions, frame, startUrl, zoomTrack]);

  const dismissLimit = useCallback(() => {
    if (sessionId) patchExport(sessionId, { limitReached: null });
  }, [sessionId]);

  return {
    run,
    saveAs,
    ...state,
    dismissLimit,
  };
}
