"use client";
import { Button } from "@castfy/ui/components/button";
import { useScroll } from "@castfy/ui/hooks/use-scroll";
import { cn } from "@castfy/ui/lib/utils";
import { ChevronRightIcon, DownloadIcon } from "lucide-react";
import { siteConfig } from "@/config/site";

export function DemoHeader({
  children,
  className,
  showChevron = true,
  title,
}: {
  children?: React.ReactNode;
  className?: string;
  showChevron?: boolean;
  title: string;
}) {
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
        <span className="text-sm">{siteConfig.name}</span>
        {children && showChevron && (
          <ChevronRightIcon className="size-4 text-muted-foreground" />
        )}
        <span className="text-sm">{title}</span>
        {children}
        <Button className="ml-auto">
          <DownloadIcon />
          Export
        </Button>
      </div>
    </header>
  );
}
