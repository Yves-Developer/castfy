"use client";
import { Button } from "@workspace/ui/components/button";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { useScroll } from "@workspace/ui/hooks/use-scroll";
import { cn } from "@workspace/ui/lib/utils";
import { ChevronRightIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

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
        "sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        scrolled && "border-b",
        className
      )}
    >
      <div className="container flex w-full items-center gap-1">
        <Button
          className={cn(open && "md:hidden", openMobile && "md:hidden")}
          onClick={() => (isMobile ? setOpenMobile(true) : setOpen(true))}
          size={"icon-lg"}
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
      </div>
    </header>
  );
}
