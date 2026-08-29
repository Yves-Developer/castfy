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
    label: "Last created by me",
    value: "last_created",
  },
  {
    label: "Last updated",
    value: "last_updated",
  },
  {
    label: "Alphabetically",
    value: "alphabetically",
  },
];
export function HomeFilters() {
  const [{ c }, setSearchParams] = useFilters();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="text-[13px] text-foreground/80"
          size="sm"
          variant={"secondary"}
        >
          {filters.find((f) => f.value === c)?.label || "Last created by me"}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit min-w-40 max-w-50">
        <DropdownMenuGroup>
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.value}
              onClick={() => setSearchParams({ c: filter.value })}
            >
              {filter.label}
              {c === filter.value && (
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
