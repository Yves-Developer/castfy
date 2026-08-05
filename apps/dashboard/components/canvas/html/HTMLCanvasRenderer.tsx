'use client';

import { forwardRef, type ReactNode, type CSSProperties } from 'react';

interface HTMLCanvasRendererProps {
  width: number;
  height: number;
  borderRadius?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

/**
 * HTML-based canvas container that replaces Konva Stage.
 * Uses pure CSS for rendering with proper overflow handling.
 */
export const HTMLCanvasRenderer = forwardRef<HTMLDivElement, HTMLCanvasRendererProps>(
  function HTMLCanvasRenderer(
    { width, height, borderRadius = 0, children, className, style, onClick, onPointerDown },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={className}
        data-html-canvas="true"
        onClick={onClick}
        onPointerDown={onPointerDown}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          minHeight: `${height}px`,
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
          isolation: 'isolate',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }
);
