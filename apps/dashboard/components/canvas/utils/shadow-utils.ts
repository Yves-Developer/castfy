export interface ShadowProps {
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowOpacity?: number;
}

export interface ShadowConfig {
  enabled: boolean;
  elevation: number;
  side: 'bottom' | 'right' | 'bottom-right';
  softness: number;
  spread: number;
  color: string;
  intensity: number;
  offsetX?: number;
  offsetY?: number;
}

/**
 * Calculate minimum padding around the image for the blur-div shadow.
 * Blur-divs fade with Gaussian falloff so we only need room for the
 * shadow offset plus a fraction of the blur (the outer fringe is
 * already nearly invisible and clips gracefully).
 */
export function calculateShadowPadding(shadow: ShadowConfig): number {
  if (!shadow.enabled) return 0;

  const { elevation, softness, offsetX, offsetY } = shadow;

  const diag = elevation * 0.707;
  const x = offsetX ?? diag;
  const y = offsetY ?? diag;
  const effectiveBlur = Math.max(softness, 12);

  // Need room for offset + ~35 % of the blur spread
  const maxOffset = Math.max(Math.abs(x), Math.abs(y));
  return Math.ceil(maxOffset * 1.5 + effectiveBlur * 0.35);
}

export function getShadowProps(shadow: ShadowConfig): ShadowProps | Record<string, never> {
  if (!shadow.enabled) return {};

  const { elevation, side, softness, color, intensity, offsetX, offsetY } = shadow;

  let x = 0;
  let y = 0;

  if (offsetX !== undefined && offsetY !== undefined) {
    x = offsetX;
    y = offsetY;
  } else {
    // Default to bottom-right shadow for natural lighting effect
    const diag = elevation * 0.707;
    const offset =
      side === 'bottom'
        ? { x: elevation * 0.3, y: elevation } // Slight right offset for natural look
        : side === 'right'
        ? { x: elevation, y: elevation * 0.3 } // Slight bottom offset
        : side === 'bottom-right'
        ? { x: diag, y: diag }
        : { x: elevation * 0.5, y: elevation * 0.8 }; // Default: more bottom, some right
    x = offset.x;
    y = offset.y;
  }

  // Parse color and darken it for better shadow visibility
  const colorMatch = color.match(/rgba?\(([^)]+)\)/)
  let shadowColor = 'rgba(0, 0, 0, 1)' // Default to black for best visibility

  if (colorMatch) {
    const parts = colorMatch[1].split(',').map(s => s.trim())
    const r = parseInt(parts[0]) || 0;
    const g = parseInt(parts[1]) || 0;
    const b = parseInt(parts[2]) || 0;
    // Darken the color for shadow (multiply by 0.3 to make it darker)
    const darkR = Math.floor(r * 0.3);
    const darkG = Math.floor(g * 0.3);
    const darkB = Math.floor(b * 0.3);
    shadowColor = `rgba(${darkR}, ${darkG}, ${darkB}, 1)`
  } else if (color.startsWith('#')) {
    const hex = color.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16) || 0;
    const g = parseInt(hex.slice(2, 4), 16) || 0;
    const b = parseInt(hex.slice(4, 6), 16) || 0;
    // Darken the color
    const darkR = Math.floor(r * 0.3);
    const darkG = Math.floor(g * 0.3);
    const darkB = Math.floor(b * 0.3);
    shadowColor = `rgba(${darkR}, ${darkG}, ${darkB}, 1)`
  }

  // Ensure minimum blur for soft shadows
  const effectiveBlur = Math.max(softness, 12);
  // Use high intensity for visible shadows
  const effectiveIntensity = Math.min(1, Math.max(0.4, intensity * 1.5));

  return {
    shadowColor,
    shadowBlur: effectiveBlur,
    shadowOffsetX: x,
    shadowOffsetY: y,
    shadowOpacity: effectiveIntensity,
  };
}

