import { Button } from "@castfy/ui/components/button";

export default function CaptionsTab() {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-muted-foreground">
        <p className="text-sm">Captions</p>
        <Button className="" variant={"ghost"}>
          Reset
        </Button>
      </div>
      <div>options</div>
    </div>
  );
}
