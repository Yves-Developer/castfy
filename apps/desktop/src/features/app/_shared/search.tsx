"use client";
import { Button } from "@castfy/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@castfy/ui/components/input-group";
import { SearchIcon, XIcon } from "lucide-react";
import { useHomeFilters } from "@/lib/store/home-filters";

/** Filters the library by title as you type. */
export default function SidebarSearch({
  placeholder,
}: {
  placeholder?: string;
}) {
  const query = useHomeFilters((s) => s.query);
  const setQuery = useHomeFilters((s) => s.setQuery);
  return (
    <InputGroup className="h-7.5">
      <InputGroupInput
        className="font-medium text-xs placeholder:text-xs"
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search..."}
        value={query}
      />
      <InputGroupAddon>
        <SearchIcon className="size-3" strokeWidth={2.7} />
      </InputGroupAddon>
      {query && (
        <InputGroupAddon align="inline-end">
          <Button
            aria-label="Clear search"
            className="rounded-full"
            onClick={() => setQuery("")}
            size="icon-sm"
            variant={"ghost"}
          >
            <XIcon />
          </Button>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
