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
  ActivityIcon,
  type LucideProps,
  ToggleLeftIcon,
  XIcon,
} from "lucide-react";
import {
  type ForwardRefExoticComponent,
  type JSX,
  type RefAttributes,
  useState,
} from "react";
import { DemoGeneral } from "./general";
import { DemoUsage } from "./usage";

interface Tpage {
  component: () => JSX.Element;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  value: "general" | "usage";
}
const pages: Tpage[] = [
  {
    value: "general",
    label: "General",
    icon: ToggleLeftIcon,
    component: DemoGeneral,
  },

  {
    value: "usage",
    label: "Usage",
    icon: ActivityIcon,
    component: DemoUsage,
  },
];

export function DemoSettings({
  open,
  openChangeAction,
}: {
  open: boolean;
  openChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [activePage, setActivePage] = useState("general");
  return (
    <Dialog onOpenChange={openChangeAction} open={open}>
      <DialogContent
        className="flex h-120 max-w-full flex-col gap-0 p-0 sm:max-w-full md:max-w-180 xl:max-w-180"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your demo settings</DialogDescription>
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

        <div className="flex h-full flex-1">
          <nav className="w-50 shrink-0 border-r p-3.75">
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
