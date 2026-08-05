'use client';

interface HTMLNoiseLayerProps {
  noiseImage: HTMLImageElement | null;
  width: number;
  height: number;
  noiseOpacity: number;
}

/**
 * HTML/CSS-based noise layer that replaces Konva NoiseLayer.
 * Renders repeating noise texture overlay.
 */
export function HTMLNoiseLayer({
  noiseImage,
  width,
  height,
  noiseOpacity,
}: HTMLNoiseLayerProps) {
  if (!noiseImage) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${noiseImage.src})`,
        backgroundRepeat: 'repeat',
        opacity: noiseOpacity,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    />
  );
}
