import type { CSSProperties, ReactNode } from "react";
import type { ZoomStyle } from "./zoom";

export type { ZoomStyle } from "./zoom";

/**
 * The browser window a demo plays in, and how far it sits from the frame's
 * edges. Shared by the studio preview and the export, so both look alike.
 *
 * The window has the same margin on every side wherever the recording's shape
 * allows it: it fills the frame less the padding, unless the page would then
 * be stretched, in which case it keeps the page's shape and centres (equal
 * margins above and below, wider at the sides, or the other way round).
 */

export type WindowStyle = "light" | "dark" | "none";
export type PaddingSize = "small" | "medium" | "large";

export interface FrameSettings {
  padding: PaddingSize;
  window: WindowStyle;
  zoom: ZoomStyle;
}

export const DEFAULT_FRAME: FrameSettings = {
  window: "light",
  padding: "medium",
  zoom: "calm",
};

/**
 * The margin around the window, as a share of the frame's width. Medium is
 * the reference demo's: 91 px on every side of a 1610 px video (5.6%).
 */
const PADDING: Record<PaddingSize, number> = {
  small: 0.03,
  medium: 0.056,
  large: 0.08,
};

/**
 * The tab row and address bar together, as a share of the window's width:
 * 82 px of a 1428 px window in the reference.
 */
const CHROME = 0.057;

/**
 * The frame size that fits the window exactly, with the same margin on every
 * side: `longEdge` wide (or tall, for a recording taller than wide), and the
 * other side whatever the window needs. Even numbers, as H.264 wants.
 */
export function fitFrameSize(
  videoAspect: number,
  settings: Pick<FrameSettings, "window" | "padding">,
  longEdge = 1920
): { width: number; height: number } {
  const p = PADDING[settings.padding];
  const k = settings.window === "none" ? 0 : CHROME;
  const a = videoAspect > 0 ? videoAspect : 16 / 9;
  // Height per unit of width: the window (page plus chrome) and the margins.
  const heightPerWidth = (1 - 2 * p) * (1 / a + k) + 2 * p;
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  if (heightPerWidth <= 1) {
    return { width: even(longEdge), height: even(longEdge * heightPerWidth) };
  }
  return { width: even(longEdge / heightPerWidth), height: even(longEdge) };
}

/** The window's corner radius, as a share of its width. */
const RADIUS = 0.008;

export interface WindowBox {
  /** Height of the tab row and address bar; 0 with no window. */
  chrome: number;
  height: number;
  left: number;
  top: number;
  width: number;
}

/**
 * Where the window goes in a frame of `frameW` by `frameH`, for a recording
 * `videoAspect` wide per unit of height.
 */
export function windowBox(
  frameW: number,
  frameH: number,
  videoAspect: number,
  settings: Pick<FrameSettings, "window" | "padding">
): WindowBox {
  const pad = frameW * PADDING[settings.padding];
  const availW = Math.max(1, frameW - 2 * pad);
  const availH = Math.max(1, frameH - 2 * pad);
  const chromeShare = settings.window === "none" ? 0 : CHROME;
  const aspect = videoAspect > 0 ? videoAspect : 16 / 9;
  // Window height for a width w: the page at its own shape plus the chrome.
  const heightFor = (w: number) => w / aspect + w * chromeShare;
  let width = availW;
  if (heightFor(width) > availH) {
    width = availH / (1 / aspect + chromeShare);
  }
  const height = heightFor(width);
  return {
    left: (frameW - width) / 2,
    top: (frameH - height) / 2,
    width,
    height,
    chrome: width * chromeShare,
  };
}

const THEMES = {
  light: {
    tabs: "#e9ecef",
    tab: "#ffffff",
    tabText: "#1f2328",
    bar: "#ffffff",
    barText: "#6b7280",
    url: "#f1f3f4",
    urlText: "#202124",
    line: "#e6e8eb",
  },
  dark: {
    tabs: "#1c1e22",
    tab: "#2b2e33",
    tabText: "#e8eaed",
    bar: "#2b2e33",
    barText: "#9aa0a6",
    url: "#1c1e22",
    urlText: "#e8eaed",
    line: "#000000",
  },
} as const;

const PROTOCOL = /^https?:\/\//;
const WWW = /^www\./;

/** "https://app.example.com/signup?x=1" as an address bar shows it. */
export function displayAddress(url: string | null | undefined): string {
  if (!url) {
    return "";
  }
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    return `${parsed.host}${path}${parsed.search}`;
  } catch {
    return url.replace(PROTOCOL, "");
  }
}

/** The tab's title when the page's own is not known: the site's name. */
export function tabTitle(url: string | null | undefined): string {
  if (!url) {
    return "New tab";
  }
  try {
    return new URL(url).host.replace(WWW, "");
  } catch {
    return "New tab";
  }
}

/**
 * The window around the recording. `box` from windowBox; the children (the
 * video, its blur boxes and the pointer) fill the page area below the chrome.
 */
export function BrowserWindow({
  box,
  settings,
  address,
  title,
  children,
}: {
  box: WindowBox;
  settings: Pick<FrameSettings, "window">;
  address?: string | null;
  title?: string | null;
  children: ReactNode;
}) {
  const radius = Math.max(8, box.width * RADIUS);
  const outer: CSSProperties = {
    position: "absolute",
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
    borderRadius: radius,
    overflow: "hidden",
    boxShadow: "0 0 0 1px rgba(0,0,0,.22), 0 30px 80px -20px rgba(0,0,0,.55)",
    display: "flex",
    flexDirection: "column",
  };
  const page: CSSProperties = {
    position: "relative",
    flex: 1,
    overflow: "hidden",
    background: "#fff",
  };

  if (settings.window === "none") {
    return (
      <div style={outer}>
        <div style={page}>{children}</div>
      </div>
    );
  }

  const theme = THEMES[settings.window];
  // Sizes below are for a 1792 px wide window, scaled to this one.
  const s = box.width / 1792;
  const row = box.chrome / 2;
  const dot = (color: string) => (
    <span
      style={{
        width: 12 * s,
        height: 12 * s,
        borderRadius: "50%",
        background: color,
        display: "block",
      }}
    />
  );
  const shownAddress = displayAddress(address);

  return (
    <div style={outer}>
      <div
        style={{
          height: row,
          background: theme.tabs,
          display: "flex",
          alignItems: "flex-end",
          padding: `0 ${12 * s}px`,
          gap: 8 * s,
        }}
      >
        <span
          style={{
            display: "flex",
            gap: 8 * s,
            alignSelf: "center",
            marginRight: 10 * s,
          }}
        >
          {dot("#ff5f57")}
          {dot("#febc2e")}
          {dot("#28c840")}
        </span>
        <span
          style={{
            height: row * 0.8,
            width: 240 * s,
            borderRadius: `${9 * s}px ${9 * s}px 0 0`,
            background: theme.tab,
            color: theme.tabText,
            display: "flex",
            alignItems: "center",
            gap: 8 * s,
            padding: `0 ${12 * s}px`,
            fontSize: 13 * s,
            fontFamily: "Inter, system-ui, sans-serif",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              width: 14 * s,
              height: 14 * s,
              borderRadius: 4 * s,
              background: theme.tabText,
              opacity: 0.85,
              flexShrink: 0,
            }}
          />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {title || tabTitle(address)}
          </span>
        </span>
      </div>
      <div
        style={{
          height: row,
          background: theme.bar,
          color: theme.barText,
          borderBottom: `1px solid ${theme.line}`,
          display: "flex",
          alignItems: "center",
          gap: 14 * s,
          padding: `0 ${14 * s}px`,
          fontSize: 14 * s,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <Arrow s={s} />
        <Arrow flip s={s} />
        <Reload s={s} />
        <span
          style={{
            flex: 1,
            height: row * 0.7,
            borderRadius: 999,
            background: theme.url,
            color: theme.urlText,
            display: "flex",
            alignItems: "center",
            gap: 8 * s,
            padding: `0 ${14 * s}px`,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <Lock s={s} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {shownAddress}
          </span>
        </span>
      </div>
      <div style={page}>{children}</div>
    </div>
  );
}

function Arrow({ s, flip = false }: { s: number; flip?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      height={16 * s}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      viewBox="0 0 16 16"
      width={16 * s}
    >
      <path
        d="M10 3 5 8l5 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Reload({ s }: { s: number }) {
  return (
    <svg aria-hidden="true" height={16 * s} viewBox="0 0 16 16" width={16 * s}>
      <path
        d="M13 8a5 5 0 1 1-1.5-3.6M13 3v3h-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function Lock({ s }: { s: number }) {
  return (
    <svg aria-hidden="true" height={13 * s} viewBox="0 0 16 16" width={13 * s}>
      <rect
        fill="currentColor"
        height="7"
        opacity=".7"
        rx="1.5"
        width="10"
        x="3"
        y="7"
      />
      <path
        d="M5 7V5a3 3 0 0 1 6 0v2"
        fill="none"
        opacity=".7"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}
