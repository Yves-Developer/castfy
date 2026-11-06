import { LibraryIcon, PlugIcon, TerminalIcon, VideoIcon } from "lucide-react";
import { SiClaude, SiOpenai } from "react-icons/si";
import { CursorLogo } from "@/components/cursor-logo";
import { Spotlight } from "./spotlight";

const AGENTS = [
  { name: "Claude Code", icon: <SiClaude />, color: "bg-[#d97757]" },
  { name: "Codex", icon: <SiOpenai />, color: "bg-black dark:bg-[#2a2d35]" },
  {
    name: "Cursor",
    icon: <CursorLogo />,
    color: "bg-[#14120b] dark:bg-[#2a2d35]",
  },
];

export function HomeAgents() {
  return (
    <Spotlight
      action={{ href: "/#faqs", label: "How it connects" }}
      edge="dots"
      icon={<TerminalIcon />}
      id="agents"
      label="Castfy MCP"
      points={[
        {
          icon: <PlugIcon />,
          title: "One connection",
          text: "Castfy connects your agent during onboarding. No API key, no extra bill.",
        },
        {
          icon: <VideoIcon />,
          title: "Same recorder",
          text: "Clicks, typing, zoom and voice, whether you ask in the app or in the terminal.",
        },
        {
          icon: <LibraryIcon />,
          title: "Same library",
          text: "Every take lands in Castfy, ready to change, blur and export.",
        },
      ]}
      text="Castfy is an MCP server too. Ask your agent for a demo where you already work; it lands in the same library."
      tint="text-[#dcf5e9] dark:text-[#12302a]"
      title="Run it from Claude Code, Codex or Cursor"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 md:flex-row md:items-start md:gap-8 md:py-6">
        <div className="w-full shrink-0 rounded-xl border bg-background p-4 shadow-[0_20px_50px_-25px_rgba(10,60,40,0.4)] md:mt-10 md:w-60">
          <p className="text-muted-foreground text-xs">Your agent</p>
          <div className="mt-3 flex flex-col gap-2">
            {AGENTS.map((a) => (
              <span
                className="flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-sm"
                key={a.name}
              >
                <span
                  className={`grid size-6 place-items-center rounded-md text-white [&_svg]:size-3.5 ${a.color}`}
                >
                  {a.icon}
                </span>
                {a.name}
              </span>
            ))}
          </div>
          <p className="mt-3 text-muted-foreground text-xs leading-5">
            Works with the agent you already pay for.
          </p>
        </div>
        <div className="w-full flex-1 overflow-hidden rounded-xl bg-[#0b0d12] font-mono text-[#d6dbe4] text-xs leading-6 shadow-[0_30px_60px_-30px_rgba(10,60,40,0.55)] sm:text-sm sm:leading-7">
          <div className="flex items-center gap-1.5 border-white/10 border-b px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="size-2.5 rounded-full bg-white/20" />
            <span className="ml-2 text-[#6b7380] text-xs">~/acme</span>
          </div>
          <div className="p-5">
            <p>
              <span className="text-brand">❯</span> Record a 30-second demo of
              the new billing page
            </p>
            <p className="text-[#6b7380]">● castfy0_start localhost:3000</p>
            <p className="text-[#6b7380]">● castfy0_click "Billing"</p>
            <p className="text-[#6b7380]">● castfy0_scroll plans</p>
            <p className="text-[#6b7380]">● castfy0_end voice: Aria</p>
            <p className="mt-2">
              Done. A 0:31 demo with a voiceover, in your Castfy library.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-sans text-white text-xs">
              <span className="size-2 rounded-full bg-[#34d27b]" />
              Claude Code is using Castfy
            </span>
          </div>
        </div>
      </div>
    </Spotlight>
  );
}
