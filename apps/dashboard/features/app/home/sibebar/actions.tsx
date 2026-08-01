import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { cn } from "@castfy/ui/lib/utils";
import { EllipsisIcon } from "lucide-react";
import React from "react";

export function AllDropdownActions({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger className={cn("text-muted-foreground", className)}>
        <EllipsisIcon
          className={cn("hidden group-hover:block", isOpen ? "block" : "")}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem>New Project</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ArchiveDropdownActions({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
      <DropdownMenuTrigger className={cn("text-muted-foreground", className)}>
        <EllipsisIcon
          className={cn("hidden group-hover:block", isOpen ? "block" : "")}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuItem>Empty Archive</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
