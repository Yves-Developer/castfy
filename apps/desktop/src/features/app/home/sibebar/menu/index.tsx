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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { bridge } from "@/lib/bridge";
import { siteConfig } from "@/config/site";
import { reportProblem } from "@/lib/report-problem";
import { useSettingsStore } from "@/lib/store/dialogs";
import { initials, signOut, useAccount } from "@/lib/use-account";
import { ModeSwitcher } from "./mode";

export function HomeDropMenu() {
  const { setActivePage } = useSettingsStore();
  const account = useAccount();
  // The app only renders the library once signed in (App.tsx), except with
  // the dev-only sign-in skip; then there is no one to show.
  const user = account?.status === "signed-in" ? account.user : null;
  const displayName = user ? user.name || user.email : "Not signed in";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full outline-0">
        <div className="flex w-full items-center gap-2">
          <Avatar className="size-7.5 rounded-lg">
            {user?.image ? (
              <AvatarImage
                alt=""
                className="rounded-lg"
                referrerPolicy="no-referrer"
                src={user.image}
              />
            ) : null}
            <AvatarFallback className="rounded-lg! bg-primary text-primary-foreground text-xs">
              {user ? initials(user.name, user.email) : "?"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium text-xs tracking-tight">
            {displayName}
          </span>
          <ChevronDownIcon className="ml-auto size-3 flex-none stroke-3 text-muted-foreground" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60" sideOffset={10}>
        {user ? (
          <>
            <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
              <span className="truncate font-medium text-xs">
                {user.name || user.email}
              </span>
              {user.name ? (
                <span className="truncate text-muted-foreground text-xs">
                  {user.email}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setActivePage("profile")}>
            My Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <ModeSwitcher />
          <DropdownMenuItem onClick={() => setActivePage("billing")}>
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => bridge.openExternal(siteConfig.links.discord)}>
            Help & feedback
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => reportProblem()}>
            Report a problem
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {user ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
