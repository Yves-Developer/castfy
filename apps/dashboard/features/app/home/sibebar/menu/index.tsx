import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@castfy/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { ModeSwitcher } from "./mode";
import { NewWorkspace } from "./new-workspace";
import { Settings } from "./settings";

const workspace = [
  {
    name: "Lecon",
    image: null,
  },
];
export function HomeDropMenu() {
  const [isNewWorkspaceDialogOpen, setIsNewWorkspaceDialogOpen] =
    useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
          <div className="flex w-full items-center gap-2">
            {workspace[0].image ? (
              <Avatar className="rounded-lg">
                <AvatarImage className="rounded-lg" src={workspace[0].image} />
                <AvatarFallback className="rounded-lg!">
                  {workspace[0].name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="flex size-7.5 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="font-medium text-sm leading-normal">
                  {workspace[0].name.charAt(0)}
                </span>
              </div>
            )}
            <span className="font-medium text-xs tracking-tight">
              {" "}
              {workspace[0].name}
            </span>
            <ChevronDownIcon className="ml-auto size-3 stroke-3 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60" sideOffset={10}>
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => setIsNewWorkspaceDialogOpen(true)}
            >
              My Workspace
            </DropdownMenuItem>
            <DropdownMenuItem>Invite to Workspace</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <ModeSwitcher />
            <DropdownMenuItem onClick={() => setIsSettingsDialogOpen(true)}>
              Settings
              <DropdownMenuShortcut>Shift+,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <NewWorkspace
        isOpen={isNewWorkspaceDialogOpen}
        onOpenChange={setIsNewWorkspaceDialogOpen}
      />
      <Settings
        isOpen={isSettingsDialogOpen}
        onOpenChangeAction={setIsSettingsDialogOpen}
      />
    </>
  );
}
