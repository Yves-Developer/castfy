import { Button } from "@castfy/ui/components/button";
import { ChevronDownIcon } from "lucide-react";

export function CoverCmsHeader() {
  return (
    <header className="container z-10 flex h-12.75 w-full items-center border-b">
      <div className="flex w-full items-center justify-between">
        <Button
          aria-label="Toggle columns"
          className="relative bg-background shadow-sm hover:bg-background dark:bg-secondary"
          role="combobox"
          size="sm"
          variant="secondary"
        >
          CMS
          <ChevronDownIcon />
        </Button>
        <div>
          <span className="font-medium text-xs">Rathon Site</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="text-muted-foreground hover:text-foreground"
            disabled
            size={"sm"}
            variant={"secondary"}
          >
            Invite
          </Button>
          <Button disabled size="sm">
            Publish
          </Button>
        </div>
      </div>
    </header>
  );
}
