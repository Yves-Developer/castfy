"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@castfy/ui/components/avatar";
import { Button, buttonVariants } from "@castfy/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { cn } from "@castfy/ui/lib/utils";
import { HomeIcon, LogOutIcon, SettingsIcon } from "lucide-react";
import { ThemeSwitcher } from "@/components/custom/theme-switcher";
import { GiveFeedbackDialog } from "../give-feedback";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-8 rounded-lg grayscale">
          <AvatarImage alt={user.name} src={user.avatar} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        sideOffset={4}
      >
        <DropdownMenuLabel className="flex items-center justify-between gap-2 font-normal text-foreground">
          <div>
            <p className="truncate font-medium text-foreground text-sm">
              {user.name}
            </p>
            <p className="truncate text-muted-foreground text-xs">
              {user.email}
            </p>
          </div>
          <SettingsIcon className="size-4" />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <GiveFeedbackDialog />
          <Button
            className="flex w-full justify-between font-normal"
            size="lg"
            variant={"ghost"}
          >
            Home Page
            <HomeIcon />
          </Button>
          <div
            className={cn(
              buttonVariants({ size: "lg", variant: "ghost" }),
              "flex w-full justify-between font-normal hover:bg-transparent!"
            )}
          >
            Theme
            <ThemeSwitcher />
          </div>

          <Button
            className="flex w-full justify-between font-normal"
            size="lg"
            variant={"ghost"}
          >
            Log out
            <LogOutIcon />
          </Button>
          <Button className="my-1 w-full">Upgrade to pro</Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
