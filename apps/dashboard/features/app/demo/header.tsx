import { Button } from "@castfy/ui/components/button";

import { DemoDropMenu } from "./menu";
export default function DemoHeader() {
  return (
    <header className="fixed top-0 z-10 flex h-12.75 w-full items-center border-b bg-background px-2.5">
      <div className="flex w-full items-center justify-between">
        <DemoDropMenu />
        <div>
          <span className="font-medium text-muted-foreground text-xs">
            Notion demo
          </span>
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
