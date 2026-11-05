import {
  CaptionsIcon,
  EyeOffIcon,
  MicIcon,
  MousePointer2Icon,
  RefreshCwIcon,
  TerminalIcon,
  ZoomInIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiteButton } from "@/components/site-button";
import { siteConfig } from "@/config/site";
import { Band } from "./band";

/** Where the tool tiles sit in the 6×4 grid; the rest stay empty frames. */
const TILES: Record<number, { icon: ReactNode; color: string }> = {
  2: { icon: <MousePointer2Icon />, color: "bg-brand" },
  7: { icon: <ZoomInIcon />, color: "bg-[#7c5cff]" },
  9: { icon: <MicIcon />, color: "bg-[#1f9d6b]" },
  12: { icon: <EyeOffIcon />, color: "bg-[#ff5c8a]" },
  16: { icon: <TerminalIcon />, color: "bg-[#0b0d12]" },
  19: { icon: <CaptionsIcon />, color: "bg-[#e08a1e]" },
  22: { icon: <RefreshCwIcon />, color: "bg-[#12b5cb]" },
};

/**
 * The beta community: an honest invitation, with Castfy's tools as tiles in
 * a grid of frames. No faces or numbers until there are real ones.
 */
export function HomeCommunity() {
  return (
    <Band id="community" soft>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="flex max-w-xl flex-col items-start gap-4">
          <h2 className="text-h2">Built with our beta testers.</h2>
          <p className="text-sub">
            Castfy is in beta. Testers shape it in the Discord: flows that
            broke, demos that worked, what to build next. Come say hi.
          </p>
          <SiteButton arrow external href={siteConfig.discordUrl}>
            Join the Discord
          </SiteButton>
        </div>
        <div
          aria-hidden
          className="mx-auto grid w-full max-w-md grid-cols-6 gap-2"
        >
          {Array.from({ length: 24 }, (_, i) => {
            const tile = TILES[i];
            return tile ? (
              <span
                className={`grid aspect-square place-items-center rounded-xl text-white shadow-[0_12px_30px_-14px_rgba(0,40,90,0.5)] [&_svg]:size-5 ${tile.color}`}
                key={i}
              >
                {tile.icon}
              </span>
            ) : (
              <span
                className="aspect-square rounded-xl border border-dashed bg-background/60"
                key={i}
              />
            );
          })}
        </div>
      </div>
    </Band>
  );
}
