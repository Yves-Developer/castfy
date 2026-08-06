"use client";

import type { Mockup } from "@/types/mockup";
import { HTMLMockupRenderer } from "./HTMLMockupRenderer";

interface MockupRendererProps {
  canvasHeight: number;
  canvasWidth: number;
  mockup: Mockup;
}

/**
 * Unified mockup renderer using HTML/CSS.
 * Supports all mockup types: iPhone, MacBook, iMac, iWatch.
 */
export function MockupRenderer({
  mockup,
  canvasWidth,
  canvasHeight,
}: MockupRendererProps) {
  return (
    <HTMLMockupRenderer
      canvasHeight={canvasHeight}
      canvasWidth={canvasWidth}
      mockup={mockup}
    />
  );
}
