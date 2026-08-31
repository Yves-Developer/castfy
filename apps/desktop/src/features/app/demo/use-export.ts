import { useCallback, useEffect, useState } from 'react';
import { bridge } from '@/lib/bridge';
import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { getBackgroundStyle } from '@/lib/constants/backgrounds';
import { getR2ImageUrl } from '@/lib/r2';
import { useBackgroundStore } from '@/lib/store';

/**
 * Renders the project as it looks in the studio.
 *
 * The background is resolved to CSS here rather than in the render bundle: the
 * gradient catalogue lives on this side, and passing the finished value keeps
 * one definition of what "magic:sunset" means instead of two.
 */
export function useExport(sessionId: string | null | undefined) {
  const { backgroundConfig, imageOverlays, selectedAspectRatio, customDimensions } =
    useBackgroundStore();

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputPath, setOutputPath] = useState<string | null>(null);

  useEffect(() => bridge.onExportProgress(({ message }) => setStatus(message ?? null)), []);

  const run = useCallback(async () => {
    if (!sessionId) return;

    const ratio = aspectRatios.find((r) => r.id === selectedAspectRatio);
    const { width, height } =
      selectedAspectRatio === 'custom' && customDimensions
        ? customDimensions
        : ratio && ratio.width > 0 && ratio.height > 0
          ? { width: ratio.width, height: ratio.height }
          : { width: 16, height: 9 };

    // Aspect ratios are expressed as ratios, so scale them to a real frame size
    // on the long edge rather than rendering a 16x9 pixel video.
    const scale = 1920 / Math.max(width, height);

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
      width: Math.round(width * scale),
      height: Math.round(height * scale),
    };

    setBusy(true);
    setError(null);
    setOutputPath(null);
    setStatus('Starting…');
    try {
      const result = await bridge.render(sessionId, spec);
      if (result.ok) setOutputPath(result.outputLocation ?? null);
      else setError(result.error ?? 'Export failed.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }, [sessionId, backgroundConfig, imageOverlays, selectedAspectRatio, customDimensions]);

  return { run, busy, status, error, outputPath };
}
