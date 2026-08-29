"use client";
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
import Link from "next/link";
import React from "react";
import { toast } from "sonner";
import { ArchiveDemo } from "./archive";
import { MoveDemo } from "./move";
import { RenameDemo } from "./rename";

export function DemoActions({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [moveOpen, setMoveOpen] = React.useState(false);
  function handleCopyLink() {
    navigator.clipboard.writeText("https://castfy.com/demo/abc");
    toast.success("Demo link copied to clipboard");
  }
  return (
    <>
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <DropdownMenuTrigger
          className={cn("relative z-2 text-muted-foreground", className)}
        >
          <EllipsisIcon
            className={cn(
              "hidden size-4 group-hover:block",
              isOpen ? "block" : ""
            )}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40" side="top">
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/demo/abc" target="_blank">
                Open in New Tab
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              Copy Demo Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMoveOpen(true)}>
              Move
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setArchiveOpen(true)}>
              Archive
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameDemo open={renameOpen} openChangeAction={setRenameOpen} />
      <ArchiveDemo open={archiveOpen} openChangeAction={setArchiveOpen} />
      <MoveDemo open={moveOpen} openChangeAction={setMoveOpen} />
    </>
  );
}
