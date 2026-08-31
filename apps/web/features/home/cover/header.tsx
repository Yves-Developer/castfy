import { Button } from "@castfy/ui/components/button";
import { ChevronDownIcon } from "lucide-react";

export function CoverCmsHeader() {
  return (
    <header className="z-10 flex h-12.75 w-full items-center border-b px-2.5">
      <div className="flex w-full items-center justify-between">
        <Button
          aria-label="Toggle columns"
          className="relative bg-background shadow-xs hover:bg-background dark:bg-secondary"
          role="combobox"
          size="sm"
          variant="secondary"
        >
          Studio
          <ChevronDownIcon />
        </Button>
        <div>
          <span className="font-medium text-xs"> castfy.app demo</span>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled size={"sm"} variant={"secondary"}>
            Save
          </Button>
          <Button size="sm">Export</Button>
        </div>
      </div>
    </header>
  );
}
