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
import { useHomeFilters } from "@/lib/store/home-filters";

/** How the library is sorted; the list reads the same values (sortProjects). */
const filters = [
  {
    label: "Newest first",
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
  const c = useHomeFilters((s) => s.order);
  const setOrder = useHomeFilters((s) => s.setOrder);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="text-[13px] text-foreground/80"
          size="sm"
          variant={"secondary"}
        >
          {filters.find((f) => f.value === c)?.label ?? filters[0].label}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit min-w-40 max-w-50">
        <DropdownMenuGroup>
          {filters.map((filter) => (
            <DropdownMenuItem
              key={filter.value}
              onClick={() => setOrder(filter.value)}
            >
              {filter.label}
              {(c === filter.value ||
                (!filters.some((f) => f.value === c) &&
                  filter === filters[0])) && (
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
