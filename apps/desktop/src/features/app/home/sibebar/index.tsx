"use client";
import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import { Grid2X2Icon, ListVideoIcon, MailIcon } from "lucide-react";
import { Suspense } from "react";
import { SiDiscord } from "react-icons/si";
import { toast } from "sonner";
import Link from "@/components/compat/link";
import { usePathname } from "@/components/compat/navigation";
import { siteConfig } from "@/config/site";
import { bridge } from "@/lib/bridge";
import SidebarSearch from "../../_shared/search";
import { AllDropdownActions } from "./actions";
import { HomeDropMenu } from "./menu";

export default function HomeSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  function handleCopyLink() {
    navigator.clipboard.writeText(siteConfig.url);
    toast.success("Castfy link copied to clipboard");
  }

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
              pathname === "/" && "text-foreground"
            )}
            size="sm"
            variant={pathname === "/" ? "secondary" : "ghost"}
          >
            <Link className="w-full" href="/">
              <Grid2X2Icon className="size-3" strokeWidth={2.7} />
              All
              <AllDropdownActions className="absolute right-2" />
            </Link>
          </Button>
          <Button
            asChild
            className={cn(
              "group relative w-full justify-normal gap-3 text-muted-foreground",
              pathname === "/recordings" && "text-foreground"
            )}
            size="sm"
            variant={pathname === "/recordings" ? "secondary" : "ghost"}
          >
            <Link className="w-full" href="/recordings">
              <ListVideoIcon className="size-3" strokeWidth={2.7} />
              Recordings
            </Link>
          </Button>
        </div>
      </div>
      {siteConfig.links.discord ? (
        <div className="mt-auto border-t px-2.5 py-2">
          <Button
            className="w-full justify-normal gap-3 text-muted-foreground"
            onClick={() => bridge.openExternal(siteConfig.links.discord)}
            size="sm"
            title="Get help and share feedback on Castfy's Discord"
            variant="ghost"
          >
            <SiDiscord className="size-3.5 text-[#5865F2]" />
            <span className="font-medium text-xs">Help & feedback</span>
            <span className="ml-auto text-[10px]">Discord</span>
          </Button>
        </div>
      ) : null}
      <div
        className={cn(
          "flex items-center border-t px-2.5 py-2.5",
          !siteConfig.links.discord && "mt-auto"
        )}
      >
        <div className="group relative flex w-full items-center gap-3 text-muted-foreground">
          <MailIcon className="size-3.5" strokeWidth={2.7} />
          <span className="font-medium text-xs">Invite Friends</span>
          <Button
            className="ml-auto text-muted-foreground text-xs hover:text-foreground"
            onClick={handleCopyLink}
            size="sm"
            variant={"secondary"}
          >
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
}
