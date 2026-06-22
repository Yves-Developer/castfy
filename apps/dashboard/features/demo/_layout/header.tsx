"use client";
import { Button } from "@castfy/ui/components/button";
import { useSidebar } from "@castfy/ui/components/sidebar";
import { useScroll } from "@castfy/ui/hooks/use-scroll";
import { cn } from "@castfy/ui/lib/utils";
import { ChevronRightIcon, DownloadIcon, MenuIcon } from "lucide-react";
import { siteConfig } from "@/config/site";

export function DemoHeader({
  children,
  className,
  title,
}: {
  children?: React.ReactNode;
  className?: string;
  title: string;
}) {
  const { open, openMobile, isMobile, setOpen, setOpenMobile } = useSidebar();
  const scrolled = useScroll(20);
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-12 shrink-0 items-center gap-2 border-b bg-background",
        scrolled && "border-b",
        className
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
        <span className="font-medium text-sm">{siteConfig.name}</span>
        <ChevronRightIcon className="size-4 text-muted-foreground" />
        <span className="font-medium text-sm">{title}</span>
        {children}
        <Button className="ml-auto">
          <DownloadIcon />
          Export
        </Button>
      </div>
    </header>
  );
}
