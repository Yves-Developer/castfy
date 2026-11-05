import {
  ClapperboardIcon,
  FrameIcon,
  ScissorsIcon,
  ZoomInIcon,
} from "lucide-react";
import Image from "next/image";
import studioShot from "@/public/landing/studio.webp";
import { Spotlight } from "./spotlight";

export function StudioSpotlight() {
  return (
    <Spotlight
      action={{ href: "/#demo", label: "Watch it make a demo" }}
      edge="ruler"
      icon={<ClapperboardIcon />}
      id="studio"
      label="Castfy Studio"
      points={[
        {
          icon: <ScissorsIcon />,
          title: "Dead time cut",
          text: "Page loads and the agent's thinking come out. A 6-minute run becomes a demo of seconds.",
        },
        {
          icon: <ZoomInIcon />,
          title: "Zoom on every click",
          text: "The camera moves to what changed and the cursor glides there, drawn smooth.",
        },
        {
          icon: <FrameIcon />,
          title: "Backgrounds and ratios",
          text: "Pick a background and a ratio for where it is going: a site, a post or a launch.",
        },
      ]}
      text="Open a take and the edit is already there: cuts, zooms, cursor and voice on one timeline. Change anything, or export as it is."
      tint="text-[#dcefff] dark:text-[#13263a]"
      title="The edit is done before you open it."
    >
      <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border border-black/10 bg-black shadow-[0_30px_80px_-30px_rgba(0,40,90,0.55)]">
        <Image
          alt="The Castfy Studio: the finished demo playing, with its timeline of cuts, zooms, voice and captions"
          className="block h-auto w-full"
          placeholder="blur"
          sizes="(min-width: 1024px) 1000px, 100vw"
          src={studioShot}
        />
      </div>
    </Spotlight>
  );
}
