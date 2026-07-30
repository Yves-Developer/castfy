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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@castfy/ui/components/tabs";
import { cn } from "@castfy/ui/lib/utils";
import {
  CirclePlusIcon,
  LaptopIcon,
  type LucideIcon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

interface SettingsPage {
  component: React.ComponentType;
  icon: LucideIcon;
  label: string;
  value: string;
}

interface SettingsTab {
  label: string;
  pages: SettingsPage[];
  value: string;
}

const TABS: SettingsTab[] = [
  {
    value: "account",
    label: "Account",
    pages: [
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
    ],
  },
  {
    value: "workspace",
    label: "Workspace",
    pages: [
      {
        value: "invite",
        label: "Invite",
        icon: CirclePlusIcon,
        component: WorkspaceInvite,
      },
    ],
  },
];

const DEFAULT_TAB = TABS[0];
const DEFAULT_PAGE = DEFAULT_TAB.pages[0];

interface SettingsProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export function Settings({ isOpen, onOpenChangeAction }: SettingsProps) {
  const [activeTab, setActiveTab] = useState(DEFAULT_TAB.value);
  const [activePage, setActivePage] = useState(DEFAULT_PAGE.value);

  const handleTabChange = (value: string) => {
    const tab = TABS.find((t) => t.value === value);
    setActiveTab(value);
    // Reset to that tab's first page so we never render a stale/missing page
    if (tab) {
      setActivePage(tab.pages[0].value);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChangeAction} open={isOpen}>
      <DialogContent
        className="h-120 p-0 sm:max-w-sm lg:max-w-lg xl:max-w-180"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and workspace preferences.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          className="h-full w-full gap-0"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <div className="flex items-center justify-between border-b px-3.75 py-2.5">
            <p className="font-medium text-sm">Settings</p>
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger
                  className="font-semibold text-xs"
                  key={tab.value}
                  value={tab.value}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

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

          {TABS.map((tab) => (
            <TabsContent className="h-full" key={tab.value} value={tab.value}>
              <div className="flex h-full">
                <nav
                  aria-label={`${tab.label} settings`}
                  className="w-50 shrink-0 border-r p-3.75"
                >
                  <ul className="flex flex-col gap-1">
                    {tab.pages.map((page) => (
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
                          variant={
                            activePage === page.value ? "secondary" : "ghost"
                          }
                        >
                          <page.icon className="size-3" strokeWidth={2.7} />
                          {page.label}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="flex-1 overflow-y-auto p-3.75">
                  {tab.pages.map((page) =>
                    activePage === page.value ? (
                      <page.component key={page.value} />
                    ) : null
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function AccountProfile() {
  return <div>Profile</div>;
}

function AccountSessions() {
  return <div>Sessions</div>;
}

function WorkspaceInvite() {
  return <div>Workspace</div>;
}
