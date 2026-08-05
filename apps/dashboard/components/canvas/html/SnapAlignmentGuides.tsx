'use client';

interface SnapAlignmentGuidesProps {
  canvasW: number;
  canvasH: number;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
}

const SNAP_THRESHOLD = 6;

export function SnapAlignmentGuides({
  canvasW,
  canvasH,
  offsetX,
  offsetY,
  isDragging,
}: SnapAlignmentGuidesProps) {
  if (!isDragging) return null;

  const showVertical = Math.abs(offsetX) < SNAP_THRESHOLD;
  const showHorizontal = Math.abs(offsetY) < SNAP_THRESHOLD;

  if (!showVertical && !showHorizontal) return null;

  return (
    <div
      data-resize-handle="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      {showVertical && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 0,
            borderLeft: '1px dashed rgba(59, 130, 246, 0.7)',
            transform: 'translateX(-0.5px)',
          }}
        />
      )}
      {showHorizontal && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: 0,
            borderTop: '1px dashed rgba(59, 130, 246, 0.7)',
            transform: 'translateY(-0.5px)',
          }}
        />
      )}
    </div>
  );
}
