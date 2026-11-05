import {
  CheckIcon,
  KeyboardIcon,
  MicIcon,
  MousePointer2Icon,
  TimerIcon,
} from "lucide-react";

const side = "pointer-events-none absolute select-none max-xl:hidden";
const card =
  "rounded-xl border bg-background shadow-[0_24px_60px_-28px_rgba(0,40,90,0.45)]";

/**
 * Real pieces of the Castfy app at both sides of the hero: the agent's steps
 * as it records, and the export with its voice.
 */
export function HeroSides() {
  const steps = [
    {
      icon: <TimerIcon />,
      kind: "Wait",
      what: "Survey finishes loading",
      t: "+0:00",
      done: true,
    },
    {
      icon: <MousePointer2Icon />,
      kind: "Click",
      what: "Start the survey",
      t: "+0:06",
      done: true,
    },
    {
      icon: <KeyboardIcon />,
      kind: "Type",
      what: "What could we improve?",
      t: "+0:14",
      done: true,
    },
    {
      icon: <MousePointer2Icon />,
      kind: "Click",
      what: "OK to continue",
      t: "+0:21",
      done: false,
    },
  ];
  return (
    <div aria-hidden>
      <div
        className={`${side} ${card} top-40 -left-10 w-64 -rotate-3 p-3.5 text-left`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Agent actions</span>
          <span className="text-muted-foreground">4 steps</span>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {steps.map((s) => (
            <div className="flex items-start gap-2.5" key={s.what}>
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-md [&_svg]:size-3 ${s.done ? "bg-secondary text-muted-foreground" : "bg-brand text-white"}`}
              >
                {s.icon}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex justify-between text-xs">
                  <span className="font-medium">{s.kind}</span>
                  <span className="font-mono text-muted-foreground">{s.t}</span>
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  {s.what}
                </span>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 border-t pt-2.5 text-muted-foreground text-xs">
          <span className="size-1.5 animate-pulse rounded-full bg-brand" />
          Working on the next step…
        </div>
      </div>
      <div
        className={`${side} ${card} top-36 -right-8 w-60 rotate-3 p-3.5 text-left`}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">Exporting</span>
          <span className="font-mono text-muted-foreground">64%</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[64%] rounded-full bg-brand" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded-md border px-1.5 py-0.5">1080p</span>
          <span className="rounded-md border px-1.5 py-0.5">16:9</span>
          <span className="rounded-md border px-1.5 py-0.5">1:59</span>
          <span className="rounded-md border px-1.5 py-0.5">On this Mac</span>
        </div>
      </div>
      <div
        className={`${side} ${card} top-[22rem] -right-2 w-52 -rotate-2 p-3 text-left xl:right-6`}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="grid size-6 place-items-center rounded-md bg-[#1f9d6b] text-white [&_svg]:size-3">
            <MicIcon />
          </span>
          <span className="font-medium">Aria</span>
          <span className="text-muted-foreground">US, female</span>
          <CheckIcon className="ml-auto size-3.5 text-brand" />
        </div>
        <div className="mt-2.5 flex h-4 items-end gap-0.5">
          {[
            3, 6, 10, 7, 12, 15, 9, 5, 8, 13, 16, 11, 6, 4, 9, 12, 8, 5, 3, 6,
            9, 5,
          ].map((h, i) => (
            <span
              className="w-1 rounded-full bg-[#1f9d6b]"
              key={`${i}-${h}`}
              style={{ height: h }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
