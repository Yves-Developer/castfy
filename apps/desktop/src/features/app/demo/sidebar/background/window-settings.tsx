"use client";
import { cn } from "@castfy/ui/lib/utils";
import { useBackgroundStore } from "@/lib/store";
import type {
  FrameSettings,
  PaddingSize,
  WindowStyle,
  ZoomStyle,
} from "../../../../../../remotion/frame";

const WINDOWS: { value: WindowStyle; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "none", label: "None" },
];
const PADDINGS: { value: PaddingSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
const ZOOMS: { value: ZoomStyle; label: string; hint: string }[] = [
  { value: "off", label: "Off", hint: "The whole window, never zoomed." },
  {
    value: "calm",
    label: "Calm",
    hint: "Moves in gently to read what is typed, and holds still otherwise.",
  },
  { value: "punchy", label: "Punchy", hint: "Zooms on every click." },
];

/** The browser window around the video, the space around it, and the zoom. */
export function WindowSettings() {
  const frame = useBackgroundStore((s) => s.frame);
  const setFrame = useBackgroundStore((s) => s.setFrame);
  const zoomHint = ZOOMS.find((z) => z.value === frame.zoom)?.hint;

  return (
    <div className="flex flex-col gap-4 p-1">
      <Choice
        label="Window"
        onChange={(window) => setFrame({ window })}
        options={WINDOWS}
        value={frame.window}
      />
      <Choice
        label="Padding"
        onChange={(padding) => setFrame({ padding })}
        options={PADDINGS}
        value={frame.padding}
      />
      <div className="flex flex-col gap-1.5">
        <Choice
          label="Zoom"
          onChange={(zoom) => setFrame({ zoom })}
          options={ZOOMS}
          value={frame.zoom}
        />
        <p className="text-[11px] text-muted-foreground leading-4">
          {zoomHint}
        </p>
      </div>
    </div>
  );
}

function Choice<T extends FrameSettings[keyof FrameSettings]>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-medium text-muted-foreground text-xs">{label}</span>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted/40 p-1">
        {options.map((option) => (
          <button
            aria-pressed={value === option.value}
            className={cn(
              "h-7 rounded-md font-medium text-xs transition-colors",
              value === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
