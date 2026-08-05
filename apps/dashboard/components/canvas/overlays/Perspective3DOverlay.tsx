'use client';

import { Frame3DOverlay, getFrameImageStyle, type FrameConfig } from '../frames/Frame3DOverlay';
import { type ShadowConfig } from '../utils/shadow-utils';
import { type ImageFilters } from '@/lib/store';

export interface Perspective3DConfig {
  perspective: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateX: number;
  translateY: number;
  scale: number;
}

interface Perspective3DOverlayProps {
  has3DTransform: boolean;
  perspective3D: Perspective3DConfig;
  screenshot: {
    rotation: number;
    radius: number;
  };
  shadow: ShadowConfig;
  frame: FrameConfig;
  showFrame: boolean;
  framedW: number;
  framedH: number;
  frameOffset: number;
  windowPadding: number;
  windowHeader: number;
  eclipseBorder: number;
  imageScaledW: number;
  imageScaledH: number;
  groupCenterX: number;
  groupCenterY: number;
  canvasW: number;
  canvasH: number;
  image: HTMLImageElement;
  imageOpacity: number;
  imageFilters?: ImageFilters;
}

export function Perspective3DOverlay({
  has3DTransform,
  perspective3D,
  screenshot,
  shadow,
  frame,
  showFrame,
  framedW,
  framedH,
  frameOffset,
  windowPadding,
  windowHeader,
  eclipseBorder,
  imageScaledW,
  imageScaledH,
  groupCenterX,
  groupCenterY,
  canvasW,
  canvasH,
  image,
  imageOpacity,
  imageFilters,
}: Perspective3DOverlayProps) {
  if (!has3DTransform) return null;

  // Build CSS filter string from imageFilters
  const buildImageFilter = () => {
    if (!imageFilters) return undefined;

    const filters: string[] = [];

    if (imageFilters.brightness !== 100) {
      filters.push(`brightness(${imageFilters.brightness / 100})`);
    }
    if (imageFilters.contrast !== 100) {
      filters.push(`contrast(${imageFilters.contrast / 100})`);
    }
    if (imageFilters.saturate !== 100) {
      filters.push(`saturate(${imageFilters.saturate / 100})`);
    }
    if (imageFilters.grayscale > 0) {
      filters.push(`grayscale(${imageFilters.grayscale / 100})`);
    }
    if (imageFilters.sepia > 0) {
      filters.push(`sepia(${imageFilters.sepia / 100})`);
    }
    if (imageFilters.hueRotate !== 0) {
      filters.push(`hue-rotate(${imageFilters.hueRotate}deg)`);
    }
    if (imageFilters.blur > 0) {
      filters.push(`blur(${imageFilters.blur}px)`);
    }
    if (imageFilters.invert > 0) {
      filters.push(`invert(${imageFilters.invert / 100})`);
    }

    return filters.length > 0 ? filters.join(' ') : undefined;
  };

  const imageFilterStyle = buildImageFilter();

  const perspective3DTransform = `
    translate(${perspective3D.translateX}%, ${perspective3D.translateY}%)
    scale(${perspective3D.scale})
    rotateX(${perspective3D.rotateX}deg)
    rotateY(${perspective3D.rotateY}deg)
    rotateZ(${perspective3D.rotateZ + screenshot.rotation}deg)
  `
    .replace(/\s+/g, ' ')
    .trim();

  // Parse shadow color and extract RGB values
  const colorMatch = shadow.color.match(/rgba?\(([^)]+)\)/)
  let r = 0, g = 0, b = 0;
  let shadowOpacity = shadow.intensity || 0.5;

  if (colorMatch) {
    const parts = colorMatch[1].split(',').map(s => s.trim())
    r = parseInt(parts[0]) || 0;
    g = parseInt(parts[1]) || 0;
    b = parseInt(parts[2]) || 0;
    if (parts.length === 4) {
      shadowOpacity = parseFloat(parts[3]) || shadow.intensity;
    }
  } else if (shadow.color.startsWith('#')) {
    const hex = shadow.color.replace('#', '')
    r = parseInt(hex.slice(0, 2), 16) || 0;
    g = parseInt(hex.slice(2, 4), 16) || 0;
    b = parseInt(hex.slice(4, 6), 16) || 0;
  }

  // Build shadow filter using direct values from store
  const buildShadowFilter = () => {
    const x = shadow.enabled ? (shadow.offsetX ?? 0) : 0;
    const y = shadow.enabled ? (shadow.offsetY ?? 0) : 0;
    const blur = shadow.enabled ? ((shadow.softness || 15) + (shadow.spread || 0)) : 15;
    const opacity = shadow.enabled ? Math.min(1, shadow.intensity) : 0.5;

    const shadows = [
      `drop-shadow(${x}px ${y}px ${blur}px rgba(${r}, ${g}, ${b}, ${opacity}))`,
      `drop-shadow(0px 0px ${blur * 0.5}px rgba(${r}, ${g}, ${b}, ${opacity * 0.2}))`,
    ];

    return shadows.join(' ');
  };

  const shadowFilter = buildShadowFilter();

  const isDark = frame.type.includes('dark');
  const isMacFrame = frame.type === 'macos-light' || frame.type === 'macos-dark';
  const isWinFrame = frame.type === 'windows-light' || frame.type === 'windows-dark';
  const isArcFrame = frame.type === 'arc-light' || frame.type === 'arc-dark';
  const isStyleFrame = ['glass-light', 'glass-dark', 'outline-light', 'border-light', 'border-dark'].includes(frame.type);

  const browserRadius = screenshot.radius;

  // Get frame container background color
  const getFrameBackground = () => {
    if (isMacFrame) {
      return isDark ? '#3A3A3C' : '#F6F6F6';
    }
    if (isWinFrame) {
      return isDark ? '#292A2D' : '#FFFFFF';
    }
    if (isStyleFrame) {
      const styleMap: Record<string, string> = {
        'glass-light': `rgba(255, 255, 255, ${frame.opacity ?? 0.25})`,
        'glass-dark': `rgba(0, 0, 0, ${frame.opacity ?? 0.3})`,
        'outline-light': `rgba(255, 255, 255, ${frame.opacity ?? 0.35})`,
        'border-light': 'rgb(255, 255, 255)',
        'border-dark': 'rgb(26, 26, 26)',
      };
      return styleMap[frame.type] || 'transparent';
    }
    return 'transparent';
  };

  // Calculate image border radius
  const getImageBorderRadius = () => {
    if (isMacFrame || isWinFrame) {
      const innerRadius = Math.max(0, browserRadius - windowPadding);
      return `0 0 ${innerRadius}px ${innerRadius}px`;
    }
    return `${screenshot.radius}px`;
  };

  return (
    <div
      data-3d-overlay="true"
      data-untransformed-x={groupCenterX - framedW / 2}
      data-untransformed-y={groupCenterY - framedH / 2}
      data-untransformed-width={framedW}
      data-untransformed-height={framedH}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${canvasW}px`,
        height: `${canvasH}px`,
        perspective: `${perspective3D.perspective}px`,
        transformStyle: 'preserve-3d',
        zIndex: 15,
        pointerEvents: 'none',
        overflow: 'hidden',
        clipPath: `inset(0 0 0 0)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: `${groupCenterX - framedW / 2}px`,
          top: `${groupCenterY - framedH / 2}px`,
          width: `${framedW}px`,
          height: `${framedH}px`,
          transform: perspective3DTransform,
          transformOrigin: 'center center',
          willChange: 'transform',
          transition: 'transform 0.125s linear',
          filter: shadowFilter,
          opacity: 1,
        }}
      >
        {/* Frame background container for macOS/Windows */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: (isMacFrame || isWinFrame || isStyleFrame) ? getFrameBackground() : 'transparent',
            borderRadius: (isMacFrame || isWinFrame || isArcFrame || isStyleFrame) ? `${isStyleFrame ? (screenshot.radius > 0 ? screenshot.radius + windowPadding : 0) : browserRadius}px` : undefined,
            overflow: 'hidden',
          }}
        >
          <Frame3DOverlay
            frame={frame}
            showFrame={showFrame}
            framedW={framedW}
            framedH={framedH}
            frameOffset={frameOffset}
            windowPadding={windowPadding}
            windowHeader={windowHeader}
            eclipseBorder={eclipseBorder}
            imageScaledW={imageScaledW}
            imageScaledH={imageScaledH}
            screenshotRadius={browserRadius}
          />

          <img
            src={image.src}
            alt="3D transformed"
            style={{
              position: 'absolute',
              left: `${frameOffset + windowPadding}px`,
              top: `${frameOffset + windowPadding + windowHeader}px`,
              width: `${imageScaledW}px`,
              height: `${imageScaledH}px`,
              objectFit: 'cover',
              opacity: imageOpacity,
              filter: imageFilterStyle,
              borderRadius: getImageBorderRadius(),
              // Apply frame border directly to image (arc, polaroid)
              ...(showFrame && getFrameImageStyle(frame, screenshot.radius)),
            }}
          />
        </div>
      </div>
    </div>
  );
}

