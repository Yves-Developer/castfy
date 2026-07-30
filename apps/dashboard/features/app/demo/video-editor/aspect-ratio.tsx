"use client";

import { Button } from "@castfy/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@castfy/ui/components/dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

export function AspectRatio() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="text-muted-foreground" variant="ghost">
          <span>16:9</span>
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-30">
        <DropdownMenuGroup>
          <DropdownMenuItem className="">
            <span>16:9</span>

            <DropdownMenuShortcut>
              <CheckIcon />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>9:16</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>1:1</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
