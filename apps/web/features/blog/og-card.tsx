import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

/**
 * The blog's share card: the blog banner's blue grain, the title in white,
 * and the site's dot dissolve along the bottom. Used by the blog page and by
 * every post (opengraph-image.tsx next to each).
 */
export const OG_SIZE = { width: 1200, height: 630 };

const web = process.cwd();

/** Where the banner ends and its dots begin. */
const PANEL_HEIGHT = 490;
/** The dissolve's grid: as on the site (features/home/patterns.tsx DotDissolve). */
const COLS = 48;
const ROWS = 5;
const CELL = OG_SIZE.width / COLS;
/** The banner's colour at its bottom edge, column by column, so each dot falls from the blue above it. */
const EDGE = [
  "#1380d5",
  "#127fd4",
  "#127fd4",
  "#137fd4",
  "#127fd4",
  "#127fd4",
  "#137fd4",
  "#127fd4",
  "#137fd4",
  "#137fd4",
  "#137fd4",
  "#127fd4",
  "#1380d5",
  "#127fd4",
  "#127fd4",
  "#127fd4",
  "#127fd4",
  "#127fd4",
  "#127fd4",
  "#127fd4",
  "#1380d5",
  "#1683d7",
  "#1f8edd",
  "#2e9fe6",
  "#3faef0",
  "#50b9f8",
  "#5fc1fa",
  "#70c7fb",
  "#81ccfb",
  "#90d1fb",
  "#99d3fb",
  "#9ed4fb",
  "#a0d5fb",
  "#a0d5fb",
  "#a0d5fb",
  "#a0d5fc",
  "#9fd5fb",
  "#9dd2fa",
  "#96cef7",
  "#8ac6f3",
  "#78baea",
  "#64ade1",
  "#529dd8",
  "#438ed1",
  "#3784cd",
  "#2f7dca",
  "#2978c9",
  "#2375c9",
];

/** A fixed pseudo-random value per dot, as the site's DotDissolve uses. */
const noise = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43_758.5453;
  return x - Math.floor(x);
};

/**
 * The banner's bottom edge breaking up into squares: full ones on the first
 * row, fewer and smaller further down, the way the site's panels end.
 */
function dissolve() {
  const dots: { x: number; y: number; d: number; color: string }[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const keep = 1 - (row + 1) / (ROWS + 1);
      if (noise(row * COLS + col) > keep) {
        continue;
      }
      const d = CELL * (0.92 - row * 0.1);
      dots.push({
        x: col * CELL + (CELL - d) / 2,
        y: PANEL_HEIGHT + row * CELL + (CELL - d) / 2,
        d,
        color: EDGE[col] ?? "#0a74d6",
      });
    }
  }
  return dots;
}

const DOTS = dissolve();

/** The site's faint dot grid, on the white below the banner. */
const GRID: { x: number; y: number }[] = [];
for (let y = PANEL_HEIGHT + 11; y < OG_SIZE.height; y += 22) {
  for (let x = 11; x < OG_SIZE.width; x += 22) {
    GRID.push({ x, y });
  }
}

export async function blogOgCard({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  const [font, banner] = await Promise.all([
    readFile(path.join(web, "assets/fonts/Inter-SemiBold.ttf")),
    readFile(path.join(web, "assets/og/banner.jpg")),
  ]);
  const size = title.length > 56 ? 60 : title.length > 30 ? 68 : 96;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        fontFamily: "Inter",
        color: "#ffffff",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: OG_SIZE.width,
          height: PANEL_HEIGHT,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* biome-ignore lint/performance/noImgElement: ImageResponse draws plain img elements only */}
        <img
          alt=""
          height={OG_SIZE.height}
          src={`data:image/jpeg;base64,${banner.toString("base64")}`}
          width={OG_SIZE.width}
        />
        {/* A shade behind the text, as on the banner, so white stays readable. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(55% 55% at 50% 50%, rgba(0,60,150,0.38), rgba(0,60,150,0) 75%)",
          }}
        />
      </div>
      {GRID.map((g) => (
        <div
          key={`g${g.x}-${g.y}`}
          style={{
            position: "absolute",
            left: g.x - 1.5,
            top: g.y - 1.5,
            width: 3,
            height: 3,
            borderRadius: 999,
            background: "#d6dbe3",
          }}
        />
      ))}
      {DOTS.map((d) => (
        <div
          key={`${d.x}-${d.y}`}
          style={{
            position: "absolute",
            left: d.x,
            top: d.y,
            width: d.d,
            height: d.d,
            borderRadius: 3,
            background: d.color,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 46,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 34,
        }}
      >
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: satori would draw a <title> as text; the word Castfy sits beside it */}
        <svg fill="#ffffff" height="34" viewBox="0 0 24 24" width="34">
          <path d="M3 11 22 2l-9 19-2-8-8-2z" />
        </svg>
        Castfy
      </div>
      <div
        style={{
          position: "absolute",
          left: 100,
          right: 100,
          top: 110,
          height: PANEL_HEIGHT - 150,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 20px",
            borderRadius: 999,
            border: "1.5px solid rgba(255,255,255,0.55)",
            background: "rgba(255,255,255,0.16)",
            fontSize: 24,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: size,
            lineHeight: 1.08,
            letterSpacing: -2,
            textShadow: "0 2px 24px rgba(0,40,110,0.3)",
          }}
        >
          {title}
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts: [{ name: "Inter", data: font, weight: 600 }] }
  );
}
