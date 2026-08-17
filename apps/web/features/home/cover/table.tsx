import { Button } from "@castfy/ui/components/button";
import {
  ArrowDownUp,
  EllipsisIcon,
  ListFilter,
  PlusIcon,
  SearchIcon,
} from "lucide-react";

const actions = [
  {
    label: "new",
    icon: PlusIcon,
  },
  {
    label: "sort",
    icon: ArrowDownUp,
  },
  {
    label: "filter",
    icon: ListFilter,
  },
  {
    label: "search",
    icon: SearchIcon,
  },
];
export function CoverCmsTable() {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="container flex h-13 items-center border-b">
        <div
          aria-orientation="horizontal"
          className="flex w-full items-center"
          role="toolbar"
        >
          {actions.map((action) => (
            <Button
              className="text-muted-foreground hover:text-foreground"
              key={action.label}
              size="icon"
              variant={"ghost"}
            >
              <action.icon />
            </Button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <Button
              aria-label="Toggle columns"
              className="relative text-muted-foreground"
              role="combobox"
              size="icon"
              variant="ghost"
            >
              <EllipsisIcon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-40 flex-1 flex-col items-center justify-center gap-2.5 text-center text-xs">
        <p className="font-semibold">No Items </p>
        <p className="text-balance font-medium text-muted-foreground">
          All collection items will be listed here.
        </p>
      </div>
    </div>
  );
}
