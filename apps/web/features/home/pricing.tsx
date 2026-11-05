import { cn } from "@castfy/ui/lib/utils";
import {
  CalendarClockIcon,
  CheckIcon,
  GiftIcon,
  InfinityIcon,
  KeyRoundIcon,
  LayersIcon,
  MinusIcon,
  MonitorPlayIcon,
  RefreshCwIcon,
  TerminalIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiClaude, SiOpenai } from "react-icons/si";
import { SiteButton } from "@/components/site-button";
import { pricing, pricingKicker } from "@/config/data";
import { siteConfig } from "@/config/site";
import type { PricingTier } from "@/types";

/** A feature's icon, as a small tile in one of the Studio's colours. */
function Tile({ icon, color }: { icon: ReactNode; color: string }) {
  return (
    <span
      className={`grid size-6 shrink-0 place-items-center rounded-md text-white [&_svg]:size-3.5 ${color}`}
    >
      {icon}
    </span>
  );
}

/** Icons for each tier's features, in the order of config/data.ts. */
const ICONS: Record<"free" | "paid", { icon: ReactNode; color: string }[]> = {
  free: [
    { icon: <LayersIcon />, color: "bg-brand" },
    { icon: <MonitorPlayIcon />, color: "bg-[#7c5cff]" },
    { icon: <TerminalIcon />, color: "bg-[#1f9d6b]" },
    { icon: <KeyRoundIcon />, color: "bg-[#e08a1e]" },
  ],
  paid: [
    { icon: <InfinityIcon />, color: "bg-brand" },
    { icon: <LayersIcon />, color: "bg-[#7c5cff]" },
    { icon: <RefreshCwIcon />, color: "bg-[#12b5cb]" },
    { icon: <CalendarClockIcon />, color: "bg-[#1f9d6b]" },
    { icon: <GiftIcon />, color: "bg-[#ff5c8a]" },
  ],
};

function Features({
  tier,
  icons,
  dark,
}: {
  tier: PricingTier;
  icons: { icon: ReactNode; color: string }[];
  dark?: boolean;
}) {
  return (
    <ul
      className={cn(
        "flex flex-col gap-3 border-t pt-6",
        dark && "border-white/10"
      )}
    >
      {tier.features.map((f, k) => (
        <li className="flex items-start gap-3 leading-6" key={f}>
          <Tile {...(icons[k] ?? icons[0])} />
          <span className={dark ? "text-white/85" : "text-foreground/85"}>
            {f}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Price({ tier, dark }: { tier: PricingTier; dark?: boolean }) {
  return (
    <p className="flex items-baseline gap-2">
      <span className="font-[450] text-5xl tracking-[-0.03em]">
        {tier.price}
      </span>
      {tier.unit ? (
        <span className={dark ? "text-white/60" : "text-muted-foreground"}>
          {tier.unit}
        </span>
      ) : null}
      {tier.was ? (
        <span
          className={cn(
            "text-sm line-through",
            dark ? "text-white/40" : "text-muted-foreground"
          )}
        >
          {tier.was}
        </span>
      ) : null}
    </p>
  );
}

/** The agents Castfy runs on, as in the hero badge. */
function Agents() {
  const tile =
    "grid size-7 place-items-center rounded-md bg-white/10 [&_svg]:size-3.5";
  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <span className={tile}>
        <SiClaude className="text-[#d97757]" />
      </span>
      <span className={tile}>
        <SiOpenai />
      </span>
      <span className={tile}>
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <title>Cursor</title>
          <path d="M12 2 21 7v10l-9 5-9-5V7z" />
          <path d="M3 7l9 5 9-5M12 12v10" />
        </svg>
      </span>
      <span className="ml-1">Runs in the agent you already pay for</span>
    </div>
  );
}

/** What each plan has, side by side; only what config/data.ts says. */
const COMPARE: {
  label: string;
  icon: ReactNode;
  color: string;
  free: ReactNode;
  paid: ReactNode;
}[] = [
  {
    label: "Demos",
    icon: <InfinityIcon />,
    color: "bg-brand",
    free: "5",
    paid: "Unlimited",
  },
  {
    label: "Every feature: record, voice, blur, export",
    icon: <LayersIcon />,
    color: "bg-[#7c5cff]",
    free: true,
    paid: true,
  },
  {
    label: "1080p export, no watermark",
    icon: <MonitorPlayIcon />,
    color: "bg-[#e08a1e]",
    free: true,
    paid: true,
  },
  {
    label: "From Claude Code, Codex or Cursor",
    icon: <TerminalIcon />,
    color: "bg-[#1f9d6b]",
    free: true,
    paid: true,
  },
  {
    label: "Updates",
    icon: <CalendarClockIcon />,
    color: "bg-[#12b5cb]",
    free: false,
    paid: "A year, and your version keeps working",
  },
  {
    label: "Price",
    icon: <GiftIcon />,
    color: "bg-[#ff5c8a]",
    free: "Free",
    paid: "$99 once ($149 after launch)",
  },
].map((r) => ({
  ...r,
  free: cell(r.free),
  paid: cell(r.paid),
}));

function cell(v: string | boolean): ReactNode {
  if (v === true) {
    return <CheckIcon aria-label="Included" className="size-4" />;
  }
  if (v === false) {
    return (
      <MinusIcon
        aria-label="Not included"
        className="size-4 text-muted-foreground/60"
      />
    );
  }
  return v;
}

export function PricingCards() {
  const { free, paid } = pricing;
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-16">
      <div className="mx-auto grid w-full max-w-[52rem] gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-6 rounded-[20px] border bg-background p-7">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-xl">{free.title}</h3>
            <p className="text-muted-foreground text-sm leading-6">
              {free.desc}
            </p>
          </div>
          <Price tier={free} />
          <SiteButton
            className="w-full"
            external
            href={siteConfig.waitlistUrl}
            variant="outline"
          >
            {free.cta}
          </SiteButton>
          <Features icons={ICONS.free} tier={free} />
        </div>

        <div className="flex flex-col gap-6 rounded-[20px] bg-[#0b0d12] p-7 text-white shadow-[0_30px_80px_-40px_rgba(0,30,70,0.6)]">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-xl">{paid.title}</h3>
              {paid.badge ? (
                <span className="rounded-full border border-brand/40 bg-brand/15 px-2.5 py-0.5 text-[#7cc7ff] text-xs">
                  {paid.badge}
                </span>
              ) : null}
            </div>
            <p className="text-sm text-white/60 leading-6">{paid.desc}</p>
          </div>
          <Price dark tier={paid} />
          <Agents />
          <SiteButton className="w-full" external href={siteConfig.waitlistUrl}>
            {paid.cta}
          </SiteButton>
          <Features dark icons={ICONS.paid} tier={paid} />
          {paid.note ? (
            <p className="mt-auto text-white/50 text-xs leading-5">
              {paid.note}
            </p>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left">
          <thead>
            <tr className="border-b">
              <th className="py-3 font-normal" />
              <th className="w-[26%] py-3 font-medium text-lg">{free.title}</th>
              <th className="w-[30%] py-3 font-medium text-lg">{paid.title}</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE.map((r) => (
              <tr className="border-b last:border-b-0" key={r.label}>
                <td className="py-3.5 pr-4">
                  <span className="flex items-center gap-3">
                    <Tile color={r.color} icon={r.icon} />
                    {r.label}
                  </span>
                </td>
                <td className="py-3.5 pr-4 text-muted-foreground">{r.free}</td>
                <td className="py-3.5 text-muted-foreground">{r.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-center text-muted-foreground text-sm italic">
        {pricingKicker}
      </p>
    </div>
  );
}
