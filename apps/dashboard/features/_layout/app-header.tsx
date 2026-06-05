"use client";
import { Button } from "@castfy/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@castfy/ui/components/popover";
import { useSidebar } from "@castfy/ui/components/sidebar";
import { useScroll } from "@castfy/ui/hooks/use-scroll";
import { cn } from "@castfy/ui/lib/utils";
import { ChevronRightIcon, EllipsisIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { GiveFeedbackDialog } from "./give-feedback";

export function AppSiteHeader({
  children,
  className,
  showChevron = true,
}: {
  children?: React.ReactNode;
  className?: string;
  showChevron?: boolean;
}) {
  const scrolled = useScroll(20);
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar();
  return (
    <header
      className={cn(
        "sticky top-0 border-b z-50 flex h-(--header-height) shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        scrolled && "border-b",
        className,
      )}
    >
      <div className="container flex w-full items-center gap-1">
        <Button
          className={cn(open && "md:hidden", openMobile && "md:hidden")}
          onClick={() => (isMobile ? setOpenMobile(true) : setOpen(true))}
          size={"icon"}
          variant={"ghost"}
        >
          <MenuIcon />
        </Button>
        <Button asChild className="text-sm" variant={"ghost"}>
          <Link href="/">{siteConfig.name}</Link>
        </Button>
        {children && showChevron && (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
        {children}
        <GiveFeedback className="ml-auto" />
      </div>
    </header>
  );
}

export function GiveFeedback({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild className={cn(className)}>
        <Button variant="ghost">
          <EllipsisIcon className="size-4.5 text-foreground/70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mx-4 w-64 p-2">
        <GiveFeedbackDialog />
      </PopoverContent>
    </Popover>
  );
}
