"use client";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { Grid2X2Icon, MailIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import SidebarSearch from "../../_shared/search";
import { HomeDropMenu } from "../menu";
import { AllDropdownActions, ArchiveDropdownActions } from "./actions";

export default function HomeSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-screen flex-col overflow-hidden border-r",
        className
      )}
    >
      <div className="flex items-center border-b px-2.5 py-2.5">
        <HomeDropMenu />
      </div>
      <div className="flex items-center border-b px-2.5 py-2.5">
        <Suspense>
          <SidebarSearch />
        </Suspense>
      </div>
      <div className="w-full space-y-3 px-2.5 py-2 md:py-2.5">
        <p className="font-semibold text-xs">Demos</p>
        <div>
          <Button
            asChild
            className={cn(
              "group relative w-full justify-normal gap-3 text-muted-foreground",
              pathname === "/demos" && "text-foreground"
            )}
            size="sm"
            variant={pathname === "/demos" ? "secondary" : "ghost"}
          >
            <div>
              <Grid2X2Icon className="size-3" strokeWidth={2.7} />
              All
              <AllDropdownActions className="absolute right-2" />
            </div>
          </Button>
          <Button
            asChild
            className={cn(
              "group relative w-full justify-normal gap-3 text-muted-foreground",
              pathname === "/demos/archived" && "text-foreground"
            )}
            size="sm"
            variant={pathname === "/demos/archived" ? "secondary" : "ghost"}
          >
            <div>
              <Trash2Icon className="size-3" strokeWidth={2.7} />
              Archived
              <ArchiveDropdownActions className="absolute right-2" />
            </div>
          </Button>
          <Button
            className="group relative w-full justify-normal gap-3 text-muted-foreground"
            size="sm"
            variant={"ghost"}
          >
            <PlusIcon className="size-3" strokeWidth={2.7} />
            New Folder...
          </Button>
        </div>
      </div>
      <div className="mt-auto flex items-center border-t px-2.5 py-2.5">
        <div className="group relative flex w-full items-center gap-3 text-muted-foreground">
          <MailIcon className="size-3" strokeWidth={2.7} />
          <span className="font-medium text-xs">Invite your team</span>
          <Button className="ml-auto" size="sm" variant={"secondary"}>
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}
