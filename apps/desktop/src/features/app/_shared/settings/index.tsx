"use client";

import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@castfy/ui/components/dialog";
import { cn } from "@castfy/ui/lib/utils";
import {
  CreditCardIcon,
  LaptopIcon,
  type LucideProps,
  PlugIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import {
  type ForwardRefExoticComponent,
  type JSX,
  type RefAttributes,
  useEffect,
  useState,
} from "react";
import { type AppInfo, bridge } from "@/lib/bridge";
import { useSettingsStore } from "@/lib/store/dialogs";
import type { TSettingPages } from "@/types";
import { AccountAgents } from "./agents";
import { AccountBilling } from "./billing";
import { AccountProfile } from "./profile";
import { AccountSessions } from "./sessions";

interface Tpage {
  component: () => JSX.Element;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: TSettingPages;
}
const pages: Tpage[] = [
  {
    value: "agents",
    label: "Agents",
    icon: PlugIcon,
    component: AccountAgents,
  },
  {
    value: "profile",
    label: "Profile",
    icon: UserRoundIcon,
    component: AccountProfile,
  },
  {
    value: "sessions",
    label: "Sessions",
    icon: LaptopIcon,
    component: AccountSessions,
  },
  {
    value: "billing",
    label: "Billing",
    icon: CreditCardIcon,
    component: AccountBilling,
  },
];

export function Settings() {
  const { open, isOpen, close, activePage, setActivePage } = useSettingsStore();
  return (
    <Dialog onOpenChange={isOpen ? close : open} open={isOpen}>
      <DialogContent
        className="flex h-120 max-w-full flex-col gap-0 p-0 sm:max-w-full md:max-w-180 xl:max-w-180"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and workspace preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-13 items-center justify-between border-b px-3.75 py-2.5">
          <p className="font-medium text-sm">Settings</p>

          <DialogClose asChild>
            <Button
              aria-label="Close settings"
              className="text-muted-foreground"
              size="icon"
              variant="ghost"
            >
              <XIcon />
            </Button>
          </DialogClose>
        </div>

        {/* min-h-0: without it a long page grows past the dialog instead of scrolling. */}
        <div className="flex h-full min-h-0 flex-1">
          <nav className="flex w-50 shrink-0 flex-col border-r p-3.75">
            <ul className="flex flex-col gap-1">
              {pages.map((page) => (
                <li key={page.value}>
                  <Button
                    aria-current={
                      activePage === page.value ? "page" : undefined
                    }
                    className={cn(
                      "w-full justify-normal gap-3 text-muted-foreground",
                      activePage === page.value && "text-foreground"
                    )}
                    onClick={() => setActivePage(page.value)}
                    size="sm"
                    variant={activePage === page.value ? "secondary" : "ghost"}
                  >
                    <page.icon className="size-3.5" strokeWidth={2.7} />
                    {page.label}
                  </Button>
                </li>
              ))}
            </ul>
            <AppVersion />
          </nav>

          <div className="flex-1 overflow-y-auto p-7.5">
            {pages.map((page) =>
              activePage === page.value ? (
                <page.component key={page.value} />
              ) : null
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const PLATFORM_NAMES: Record<string, string> = {
  darwin: "macOS",
  win32: "Windows",
  linux: "Linux",
};

/** Which Castfy this is, for bug reports: "Castfy 0.1.0-beta.20 · macOS arm64". */
function AppVersion() {
  const [info, setInfo] = useState<AppInfo | null>(null);
  useEffect(() => {
    bridge
      .appInfo()
      .then(setInfo)
      .catch(() => {
        // Not shown; the rest of Settings works without it.
      });
  }, []);
  if (!info) {
    return null;
  }
  return (
    <p className="mt-auto select-text px-2 text-[10px] text-muted-foreground">
      Castfy {info.version} · {PLATFORM_NAMES[info.platform] ?? info.platform}{" "}
      {info.arch}
    </p>
  );
}
