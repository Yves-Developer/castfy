"use client";
import { Badge } from "@castfy/ui/components/badge";
import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@castfy/ui/components/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { cn } from "@castfy/ui/lib/utils";
import { EllipsisIcon } from "lucide-react";
import React from "react";

export function DemoActions({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger
        className={cn("relative z-2 text-muted-foreground", className)}
      >
        <Badge
          className={cn(
            "font-semibold text-[11px] text-muted-foreground",
            isOpen ? "hidden" : "group-hover:hidden"
          )}
          variant={"secondary"}
        >
          Draft
        </Badge>
        <EllipsisIcon
          className={cn(
            "hidden size-4 group-hover:block",
            isOpen ? "block" : ""
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" side="top">
        <DropdownMenuGroup>
          <DropdownMenuItem>Open in New Tab</DropdownMenuItem>
          <DropdownMenuItem>Copy Link</DropdownMenuItem>
          <DropdownMenuItem>Move</DropdownMenuItem>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DemoContextMenuActions() {
  return (
    <>
      <ContextMenuItem>Open in New Tab</ContextMenuItem>
      <ContextMenuItem>Copy Link</ContextMenuItem>
      <ContextMenuItem>Move</ContextMenuItem>
      <ContextMenuItem>Rename</ContextMenuItem>
      <ContextMenuItem>Delete</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Archive</ContextMenuItem>
    </>
  );
}
