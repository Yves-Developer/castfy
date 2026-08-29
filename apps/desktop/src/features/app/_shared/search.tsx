"use client";
import { Button } from "@castfy/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@castfy/ui/components/input-group";
import { SearchIcon, XIcon } from "lucide-react";
import { debounce } from "nuqs";
import { useTransition } from "react";
import { useFilters } from "@/lib/nuqs-params";

export default function SidebarSearch({
  placeholder,
}: {
  placeholder?: string;
}) {
  const [_isPending, startTransition] = useTransition();
  const [{ q }, setSearchParams] = useFilters({
    startTransition,
  });
  const onClear = () => setSearchParams({ q: "" });
  return (
    <InputGroup className="h-7.5">
      <InputGroupInput
        className="font-medium text-xs placeholder:text-xs"
        onChange={(e) => {
          startTransition(async () => {
            await setSearchParams(
              { q: e.target.value },
              {
                limitUrlUpdates: e.target.value.length
                  ? debounce(500)
                  : undefined,
              }
            );
          });
        }}
        placeholder={placeholder || "Search..."}
        value={q || ""}
      />
      <InputGroupAddon>
        <SearchIcon className="size-3" strokeWidth={2.7} />
      </InputGroupAddon>
      {q && (
        <InputGroupAddon align="inline-end">
          <Button
            className="rounded-full"
            onClick={onClear}
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
