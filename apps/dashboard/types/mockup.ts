export type MockupType = "iphone" | "macbook" | "imac" | "iwatch";

export interface MockupScreenArea {
  borderRadius?: number;
  height: number;
  notch?: {
    x: number;
    y: number;
    width: number;
    height: number;
    borderRadius?: number;
  };
  width: number;
  x: number;
  y: number;
}

export interface MockupDefinition {
  id: string;
  name: string;
  preview?: string;
  screenArea: MockupScreenArea;
  src: string;
  type: MockupType;
}

export interface Mockup {
  definitionId: string;
  id: string;
  imageFit: "cover" | "contain" | "fill";
  isVisible: boolean;
  opacity: number;
  position: { x: number; y: number };
  rotation: number;
  size: number;
}
