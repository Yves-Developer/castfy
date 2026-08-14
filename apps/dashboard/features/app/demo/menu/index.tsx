"use client";
import { Button } from "@castfy/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { ArrowLeftIcon, ChevronDownIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSettingsStore } from "@/lib/store/dialogs";
import { DemoSettings } from "../settings";
import { Appearance } from "./appearance";

export function DemoDropMenu() {
  const { setActivePage } = useSettingsStore();
  const [openSettings, setOpenSettings] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Toggle columns"
            className="relative bg-background shadow-sm hover:bg-background dark:bg-secondary"
            role="combobox"
            size="sm"
            variant="secondary"
          >
            Studio
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/">
                <ArrowLeftIcon />
                Go to demos
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenSettings(true)}>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Quick Actions
              <DropdownMenuShortcut>Ctrl+K</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Appearance</DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <Appearance />
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuItem>Feedback</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setActivePage("profile");
              }}
            >
              Your Account
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DemoSettings open={openSettings} openChangeAction={setOpenSettings} />
    </>
  );
}
