import { ScrollArea } from "@castfy/ui/components/scroll-area";
import { Separator } from "@castfy/ui/components/separator";
import React from "react";

const tags = Array.from({ length: 50 }).map(
  (_, i, a) => `v1.2.0-beta.${a.length - i}`
);

export function Cursor() {
  return (
    <ScrollArea className="h-full w-full">
      <div className="p-4">
        <h4 className="mb-4 font-medium text-sm leading-none">Cursor</h4>

        {tags.map((tag) => (
          <React.Fragment key={tag}>
            <div className="text-sm">{tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
