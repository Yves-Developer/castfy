import { Button } from "@castfy/ui/components/button";
import { Separator } from "@castfy/ui/components/separator";
import { CropIcon } from "lucide-react";

export function EditorHeader() {
  return (
    <div className="flex items-center justify-center gap-2">
      <Separator orientation="vertical" />
      <Button className="text-muted-foreground" variant={"ghost"}>
        <CropIcon />
        Crop Video
      </Button>
    </div>
  );
}
