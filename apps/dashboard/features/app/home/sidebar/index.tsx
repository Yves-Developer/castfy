"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@castfy/ui/components/avatar";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { IoSettingsOutline } from "react-icons/io5";
import { LuSparkles } from "react-icons/lu";
import { PiClosedCaptioning, PiCursorClickLight } from "react-icons/pi";
import { TbBackground } from "react-icons/tb";
import { useSibebarStore } from "@/hooks/store";
import type { TsidebarPage } from "@/types";
import AiTab from "./ai";
import BackgroundTab from "./background";
import CaptionsTab from "./captions";
import CursorTab from "./cursor";
import SettingsTab from "./settings";

const sidebarPages: TsidebarPage[] = [
  {
    label: "AI",
    slug: "ai",
    icon: LuSparkles,
    component: AiTab,
  },
  {
    label: "Cursor",
    slug: "cursor",
    icon: PiCursorClickLight,
    component: CursorTab,
  },
  {
    label: "Background",
    slug: "background",
    icon: TbBackground,
    component: BackgroundTab,
  },
  {
    label: "Captions",
    slug: "captions",
    icon: PiClosedCaptioning,
    component: CaptionsTab,
  },
  {
    label: "Settings",
    slug: "settings",
    icon: IoSettingsOutline,
    component: SettingsTab,
  },
];
const user = {
  image: "/lecon.png",
  name: "lecon",
};
export default function AppSidebar() {
  const { activePage, setActivePage } = useSibebarStore();
  return (
    <aside className="flex h-full divide-x">
      <div className="flex flex-col p-2">
        <div className="flex flex-col gap-1">
          {sidebarPages.map((tab) => (
            <Button
              aria-current={activePage === tab.slug ? "page" : undefined}
              className={cn(
                "text-muted-foreground",
                activePage === tab.slug && "text-foreground"
              )}
              key={tab.label}
              onClick={() => setActivePage(tab.slug)}
              size="icon-lg"
              title={tab.label}
              variant={activePage === tab.slug ? "secondary" : "ghost"}
            >
              <tab.icon className="size-5" />
            </Button>
          ))}
        </div>
        <Avatar className="mt-auto size-8 rounded-lg after:border-0">
          <AvatarImage alt={user.name} src={user.image} />
          <AvatarFallback className="rounded-lg">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="p-2">
        {sidebarPages.map((tab) =>
          activePage === tab.slug ? <tab.component key={tab.slug} /> : null
        )}
      </div>
    </aside>
  );
}
