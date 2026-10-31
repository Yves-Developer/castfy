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
import React from "react";
import type { Tdemo } from "@/types";
import { DeleteDemo } from "./delete";
import { RenameDemo } from "./rename";

/** A project card's menu: rename it, or delete it. */
export function DemoActions({
  className,
  demo,
}: {
  className?: string;
  demo: Tdemo;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  return (
    <>
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <DropdownMenuTrigger
          aria-label={`Actions for ${demo.name}`}
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
            <DropdownMenuItem onClick={() => setRenameOpen(true)}>
              Rename
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => setDeleteOpen(true)}
              variant="destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <RenameDemo
        demo={demo}
        open={renameOpen}
        openChangeAction={setRenameOpen}
      />
      <DeleteDemo
        demo={demo}
        open={deleteOpen}
        openChangeAction={setDeleteOpen}
      />
    </>
  );
}
