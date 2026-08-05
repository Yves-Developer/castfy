"use client";

import { cn } from "@castfy/ui/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useImageStore } from "@/lib/store";

type BrowserStyle = "safari" | "safari-dark" | "chrome" | "chrome-dark";

const browserStyles: {
  value: BrowserStyle;
  label: string;
  frameType: "macos-light" | "macos-dark" | "windows-light" | "windows-dark";
}[] = [
  { value: "safari", label: "Safari", frameType: "macos-light" },
  { value: "safari-dark", label: "Safari Dark", frameType: "macos-dark" },
  { value: "chrome", label: "Chrome", frameType: "windows-light" },
  { value: "chrome-dark", label: "Chrome Dark", frameType: "windows-dark" },
];

const frameToStyle: Record<string, BrowserStyle> = {
  "macos-light": "safari",
  "macos-dark": "safari-dark",
  "windows-light": "chrome",
  "windows-dark": "chrome-dark",
};

function BrowserPreview({
  style,
  selected,
}: {
  style: BrowserStyle;
  selected: boolean;
}) {
  const isDark = style === "safari-dark" || style === "chrome-dark";
  const isSafari = style === "safari" || style === "safari-dark";

  const titleBarBg = isDark
    ? isSafari
      ? "#3A3A3C"
      : "#202124"
    : isSafari
      ? "#F6F6F6"
      : "#DEE1E6";
  const activeBg = isDark ? "#292A2D" : "#FFFFFF";
  const contentBg = isDark ? "#1E1E1E" : "#FFFFFF";
  const outerBg = isDark ? "rgb(60, 60, 65)" : "rgb(210, 210, 214)";

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-lg transition-all",
        selected
          ? "ring-[1.5px] ring-primary ring-offset-1 ring-offset-card"
          : "ring-1 ring-border/50"
      )}
      style={{ backgroundColor: outerBg }}
    >
      <div
        className="absolute overflow-hidden rounded-[5px]"
        style={{
          top: "19.5%",
          left: "19.5%",
          width: "95.5%",
          height: "95.5%",
          display: "flex",
          flexDirection: "column",
          boxShadow: isDark
            ? "0 2px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.08)"
            : "0 2px 8px rgba(0,0,0,0.18)",
          border: isDark ? "1px solid rgba(255,255,255,0.06)" : undefined,
        }}
      >
        {isSafari ? (
          <>
            {/* Safari: single title bar */}
            <div
              style={{
                background: titleBarBg,
                height: "16%",
                display: "flex",
                alignItems: "center",
                gap: "2px",
                paddingLeft: "8%",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "3.5px",
                  height: "3.5px",
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: "3.5px",
                  height: "3.5px",
                  borderRadius: "50%",
                  backgroundColor: "#febc2e",
                }}
              />
              <div
                style={{
                  width: "3.5px",
                  height: "3.5px",
                  borderRadius: "50%",
                  backgroundColor: "#28c840",
                }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Chrome: tab bar + address bar */}
            <div
              style={{
                background: titleBarBg,
                height: "11%",
                display: "flex",
                alignItems: "flex-end",
                flexShrink: 0,
                position: "relative",
                paddingLeft: "8%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2px",
                  position: "absolute",
                  top: "50%",
                  left: "8%",
                  transform: "translateY(-50%)",
                }}
              >
                <div
                  style={{
                    width: "3.5px",
                    height: "3.5px",
                    borderRadius: "50%",
                    backgroundColor: "#ff5f57",
                  }}
                />
                <div
                  style={{
                    width: "3.5px",
                    height: "3.5px",
                    borderRadius: "50%",
                    backgroundColor: "#febc2e",
                  }}
                />
                <div
                  style={{
                    width: "3.5px",
                    height: "3.5px",
                    borderRadius: "50%",
                    backgroundColor: "#28c840",
                  }}
                />
              </div>
              <div
                style={{
                  marginLeft: "25%",
                  height: "70%",
                  width: "35%",
                  background: activeBg,
                  borderRadius: "3px 3px 0 0",
                }}
              />
            </div>
            <div
              style={{ background: activeBg, height: "9%", flexShrink: 0 }}
            />
          </>
        )}
        {/* Content area */}
        <div style={{ background: contentBg, flexGrow: 1 }} />
      </div>
    </div>
  );
}

export function BrowserMockupSection() {
  const {
    imageBorder,
    setImageBorder,
    browserUrl,
    setBrowserUrl,
    browserHeaderSize,
    setBrowserHeaderSize,
  } = useImageStore();

  const currentStyle = frameToStyle[imageBorder.type] || "chrome-dark";

  const handleStyleChange = (style: BrowserStyle) => {
    const config = browserStyles.find((s) => s.value === style);
    if (!config) {
      return;
    }
    setImageBorder({
      enabled: true,
      type: config.frameType,
      title: browserUrl,
    });
  };

  return (
    <>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 p-1">
          {browserStyles.map(({ value, label }) => {
            const isSelected = currentStyle === value;
            return (
              <button
                className="group flex flex-col items-center gap-1.5"
                key={value}
                onClick={() => handleStyleChange(value)}
                type="button"
              >
                <BrowserPreview selected={isSelected} style={value} />
                <span
                  className={cn(
                    "text-[10px] leading-tight transition-colors",
                    isSelected
                      ? "font-medium text-foreground"
                      : "text-muted-foreground group-hover:text-foreground/70"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label
          className="mb-2 block font-medium text-muted-foreground text-xs"
          htmlFor="browser-url"
        >
          URL
        </label>
        <input
          className="h-9 w-full rounded-[10px] bg-muted/80 px-3 text-foreground text-xs shadow-[0_0_0_1px] shadow-border/50 transition-shadow placeholder:text-muted-foreground focus:shadow-[0_0_0_2px] focus:shadow-primary focus:outline-none dark:bg-muted/50"
          id="browser-url"
          onChange={(e) => setBrowserUrl(e.target.value)}
          placeholder="yourapp.com"
          type="text"
          value={browserUrl}
        />
      </div>

      <Slider
        label="Header size"
        max={200}
        min={50}
        onValueChange={(value) => setBrowserHeaderSize(value[0])}
        step={5}
        value={[browserHeaderSize]}
        valueDisplay={`${browserHeaderSize}%`}
      />
    </>
  );
}
