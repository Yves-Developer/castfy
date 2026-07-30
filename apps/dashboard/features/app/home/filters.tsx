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
import { useFilters } from "@/lib/nuqs-params";

const filters = [
  {
    label: "Last viewed by me",
    value: "last_viewed",
  },
  {
    label: "Last edited",
    value: "last_edited",
  },
  {
    label: "Alphabetically",
    value: "alphabetically",
  },
];
export function ProjectsFilters() {
  const [{ c }, setSearchParams] = useFilters();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={"text-[13px]"} size="sm" variant={"secondary"}>
          {filters.find((f) => f.value === c)?.label || "Last viewed by me"}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit min-w-40 max-w-50">
        <DropdownMenuGroup>
          {filters.map((filter, i) => (
            <DropdownMenuItem
              key={filter.value}
              onClick={() => setSearchParams({ c: filter.value })}
            >
              {filter.label}
              {i === 0 && (
                <DropdownMenuShortcut>
                  <CheckIcon className="text-muted-foreground" />
                </DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
