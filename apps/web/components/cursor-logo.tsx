import type { ComponentProps } from "react";

/**
 * Cursor's mark (the editor): a hexagon with a triangle cut out of it.
 * Drawn in currentColor so it sits on any tile.
 */
export function CursorLogo(props: ComponentProps<"svg">) {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" {...props}>
      <title>Cursor</title>
      <path
        clipRule="evenodd"
        d="M9.586.109 1.576 4.732a.71.71 0 0 0-.35.605v9.323c0 .25.135.479.35.603l8.008 4.625a.83.83 0 0 0 .831 0l8.008-4.625a.7.7 0 0 0 .35-.603V5.337a.71.71 0 0 0-.35-.605L10.414.109a.84.84 0 0 0-.83 0M2.214 5.282h15.459c.219 0 .358.239.247.429L10.192 19.098c-.052.09-.191.054-.191-.05v-8.769a.52.52 0 0 0-.246-.425L2.163 5.473c-.09-.052-.053-.191.051-.191Z"
        fillRule="evenodd"
      />
    </svg>
  );
}
