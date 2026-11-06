import { cn } from "@castfy/ui/lib/utils";
import { proof } from "@/config/data";
import { Band } from "./band";

/** Seconds out of "396 s". */
const seconds = (value: string) => Number.parseFloat(value);

/** How many times shorter the finished demo is, e.g. "48×". */
function ratio(raw: string, cut: string) {
  const r = seconds(raw) / seconds(cut);
  return r >= 10 ? `${Math.round(r)}×` : `${r.toFixed(1)}×`;
}

/**
 * The recording as a bar: the finished part in brand blue, the part Castfy
 * cut as the blur hatch, so the dead time is visible at a glance.
 */
function CutBar({
  raw,
  cut,
  tall,
}: {
  raw: string;
  cut: string;
  tall?: boolean;
}) {
  const kept = Math.max(1.5, (seconds(cut) / seconds(raw)) * 100);
  return (
    <div
      aria-hidden
      className={cn(
        "flex w-full overflow-hidden rounded-md border",
        tall ? "h-9" : "h-3"
      )}
    >
      <div className="h-full bg-brand" style={{ width: `${kept}%` }} />
      <div className="h-full flex-1 text-[#e08a1e]/45 [background-image:repeating-linear-gradient(-45deg,currentColor_0_3px,transparent_3px_9px)]" />
    </div>
  );
}

/**
 * Proof from real runs, laid out like a wall of quotes: the survey in a
 * large card, the others beside it, the lowest one included.
 */
export function HomeProof() {
  const [first, ...rest] = proof.rows;
  return (
    <Band edge="hatch" id="proof" ruler tone="amber">
      <div className="flex flex-col gap-12">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
          <h2 className="text-h2">Minutes of agent work. A demo you can ship.</h2>
          <p className="text-sub">
            Four real runs with Claude Code. Page loads, retries and the agent
            thinking are never recorded. You get only the steps, narrated.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col justify-between gap-10 rounded-2xl border bg-background p-6 md:p-8">
            <div className="flex items-center justify-between text-muted-foreground text-sm">
              <span>{first.label}</span>
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 font-mono text-brand text-xs">
                {ratio(first.raw, first.cut)} shorter
              </span>
            </div>
            <div className="flex flex-col gap-5">
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-[450] text-5xl tracking-[-0.03em] md:text-6xl">
                <span className="text-muted-foreground/50 line-through decoration-2">
                  {first.raw}
                </span>
                <span>→</span>
                <span className="text-brand">{first.cut}</span>
              </p>
              <CutBar cut={first.cut} raw={first.raw} tall />
              <div className="flex justify-between gap-4 font-mono text-muted-foreground text-xs">
                <span className="shrink-0">Finished demo</span>
                <span className="text-right">
                  Never recorded: page loads, waits, the agent thinking
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {rest.map((row) => (
              <div
                className="flex flex-col gap-3 rounded-2xl border bg-background p-5"
                key={row.label}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    {ratio(row.raw, row.cut)} shorter
                  </span>
                </div>
                <p className="font-[450] text-2xl tracking-[-0.02em]">
                  <span className="text-muted-foreground/50 line-through">
                    {row.raw}
                  </span>{" "}
                  → <span className="text-brand">{row.cut}</span>
                </p>
                <CutBar cut={row.cut} raw={row.raw} />
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 text-muted-foreground text-sm leading-6 md:grid-cols-2">
          <p>{proof.caveat}</p>
          <p>{proof.cost}</p>
        </div>
      </div>
    </Band>
  );
}
