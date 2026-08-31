/** biome-ignore-all lint/correctness/noChildrenProp: <explanation */

import { Button } from "@castfy/ui/components/button";
import { DemoInfo } from "./info";

export function DemoGeneral() {
  return (
    <div className="flex h-full flex-1 flex-col gap-5">
      <DemoInfo />
      <div className="mt-auto flex items-center gap-2">
        <Button className="flex-1" size="md" variant="secondary">
          Archive
        </Button>
        <Button className="flex-1" size="md" variant="destructive">
          Delete
        </Button>
      </div>
    </div>
  );
}
