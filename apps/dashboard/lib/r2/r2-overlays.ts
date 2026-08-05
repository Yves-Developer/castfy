/**
 * R2 Overlay Assets Configuration
 *
 * These are the paths to overlay images stored in Cloudflare R2.
 * The paths are relative to the R2 bucket root.
 */

import { getR2PublicUrl } from ".";

/**
 * Arrow overlay paths in R2
 */
export const ARROW_PATHS = [
  "overlays/arrow/arrow-1.svg",
  "overlays/arrow/arrow-2.svg",
  "overlays/arrow/arrow-3.svg",
  "overlays/arrow/arrow-4.svg",
  "overlays/arrow/arrow-5.svg",
  "overlays/arrow/arrow-6.svg",
  "overlays/arrow/arrow-7.svg",
  "overlays/arrow/arrow-8.svg",
  "overlays/arrow/arrow-9.svg",
  "overlays/arrow/arrow-10.svg",
] as const;

/**
 * Shadow overlay paths in R2
 */
export const SHADOW_OVERLAY_PATHS = [
  "overlays/shadow/001.webp",
  "overlays/shadow/002.webp",
  "overlays/shadow/007.webp",
  "overlays/shadow/017.webp",
  "overlays/shadow/019.webp",
  "overlays/shadow/023.webp",
  "overlays/shadow/031.webp",
  "overlays/shadow/037.webp",
  "overlays/shadow/041.webp",
  "overlays/shadow/050.webp",
  "overlays/shadow/053.webp",
  "overlays/shadow/057.webp",
  "overlays/shadow/063.webp",
  "overlays/shadow/064.webp",
  "overlays/shadow/082.webp",
  "overlays/shadow/083.webp",
  "overlays/shadow/088.webp",
  "overlays/shadow/097.webp",
  "overlays/shadow/099.webp",
] as const;

/**
 * All overlay paths combined
 */
export const OVERLAY_PATHS = [...ARROW_PATHS, ...SHADOW_OVERLAY_PATHS] as const;

export type ArrowPath = (typeof ARROW_PATHS)[number];
export type ShadowOverlayPath = (typeof SHADOW_OVERLAY_PATHS)[number];
export type OverlayPath = (typeof OVERLAY_PATHS)[number];

/**
 * Get full R2 URL for an overlay image
 */
export function getOverlayUrl(path: string): string {
  return getR2PublicUrl(path);
}

/**
 * Check if a path is a known overlay path
 */
export function isOverlayPath(path: string): boolean {
  return (OVERLAY_PATHS as readonly string[]).includes(path);
}

/**
 * Check if a path is an arrow overlay
 */
export function isArrowPath(path: string): boolean {
  return (ARROW_PATHS as readonly string[]).includes(path);
}

/**
 * Check if a path is a shadow overlay
 */
export function isShadowOverlayPath(path: string): boolean {
  return (SHADOW_OVERLAY_PATHS as readonly string[]).includes(path);
}

/**
 * Get all available overlay paths
 */
export function getAllOverlayPaths(): readonly string[] {
  return OVERLAY_PATHS;
}

/**
 * Get all arrow paths
 */
export function getAllArrowPaths(): readonly string[] {
  return ARROW_PATHS;
}

/**
 * Get all shadow overlay paths
 */
export function getAllShadowOverlayPaths(): readonly string[] {
  return SHADOW_OVERLAY_PATHS;
}
