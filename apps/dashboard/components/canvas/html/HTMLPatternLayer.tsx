'use client';

import { useMemo } from 'react';

interface HTMLPatternLayerProps {
  patternImage: HTMLCanvasElement | null;
  width: number;
  height: number;
  patternOpacity: number;
}

/**
 * HTML/CSS-based pattern layer that replaces Konva PatternLayer.
 * Renders repeating pattern backgrounds.
 */
export function HTMLPatternLayer({
  patternImage,
  width,
  height,
  patternOpacity,
}: HTMLPatternLayerProps) {
  // Convert pattern canvas to data URL
  const patternDataUrl = useMemo(() => {
    if (!patternImage) return null;
    try {
      return patternImage.toDataURL('image/png');
    } catch {
      return null;
    }
  }, [patternImage]);

  if (!patternDataUrl) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${patternDataUrl})`,
        backgroundRepeat: 'repeat',
        opacity: patternOpacity,
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  );
}
