'use client';

import { HTMLMockupRenderer } from './HTMLMockupRenderer';
import type { Mockup } from '@/types/mockup';

interface MockupRendererProps {
  mockup: Mockup;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Unified mockup renderer using HTML/CSS.
 * Supports all mockup types: iPhone, MacBook, iMac, iWatch.
 */
export function MockupRenderer({ mockup, canvasWidth, canvasHeight }: MockupRendererProps) {
  return (
    <HTMLMockupRenderer
      mockup={mockup}
      canvasWidth={canvasWidth}
      canvasHeight={canvasHeight}
    />
  );
}
