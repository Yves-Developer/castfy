import { Button } from "@castfy/ui/components/button";
import { cn } from "@castfy/ui/lib/utils";
import {
  PauseIcon,
  ProportionsIcon,
  Redo2Icon,
  SkipBackIcon,
  SkipForwardIcon,
  Undo2Icon,
} from "lucide-react";
import Image from "next/image";
import { demoVideoUrl } from "@/config/data";
import editorCover from "@/public/editor_cover.jpg";

export function StudioEditor() {
  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex h-full flex-col gap-4 px-2.5 py-4">
        <div className="flex h-full w-full flex-1 flex-col items-center justify-center">
          <div
            className="relative flex items-center justify-center overflow-hidden rounded-lg border"
            style={{
              aspectRatio: `${16 / 9}`,
              height: "100%",
              maxHeight: "70vh",
            }}
          >
            <Image
              alt="cover image"
              className="absolute inset-0 object-cover"
              fill
              sizes="100vw"
              src={editorCover}
            />
            <video
              autoPlay
              className="relative z-10 w-[80%] rounded-xl shadow-lg"
              controls={false}
              loop
              muted
              playsInline
              src={demoVideoUrl}
            />
          </div>
        </div>
        <div className="mt-auto flex w-full items-center gap-4">
          <div className="flex-1">
            <Button
              aria-label="Undo"
              className={cn(
                "rounded-full",
                "text-muted-foreground transition-all duration-150"
              )}
              size="icon"
              title="Undo (Cmd+Z)"
              variant={"ghost"}
            >
              <Undo2Icon />
            </Button>
            <Button
              aria-label="Redo"
              className={cn(
                "rounded-full",
                "text-muted-foreground transition-all duration-150"
              )}
              size="icon"
              title="Redo (Cmd+Shift+Z)"
              variant={"ghost"}
            >
              <Redo2Icon />
            </Button>
          </div>
          <div className="flex flex-1 items-center justify-center gap-2 font-medium">
            <p className="min-w-7 text-muted-foreground text-xs">00:00</p>
            <Button
              aria-label="Rewind 10 seconds"
              className={"rounded-full text-muted-foreground"}
              size="icon"
              title="Rewind 10 seconds"
              variant="ghost"
            >
              <SkipBackIcon strokeWidth={2.5} />
            </Button>
            <Button className="rounded-full" size="icon">
              <PauseIcon strokeWidth={2.5} />
            </Button>
            <Button
              aria-label="Forward 10 seconds"
              className={"rounded-full text-muted-foreground"}
              size="icon"
              title="Forward 10 seconds"
              variant="ghost"
            >
              <SkipForwardIcon strokeWidth={2.5} />
            </Button>
            <p className="min-w-7 text-muted-foreground text-xs">10:00</p>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              className="h-8 gap-1.5 rounded-lg px-2.5 text-muted-foreground hover:text-foreground"
              size="sm"
              variant="ghost"
            >
              <ProportionsIcon size={15} />
              <span className="text-xs">16:9</span>
            </Button>
          </div>
        </div>
      </div>
      <footer className="mt-auto h-30 border-t p-2.5">
        <div className="group relative flex flex-col gap-2">
          {/* Static overlay tracks (visual only for now) */}
          <div className="flex justify-around">
            <div className="h-5 w-1/4 rounded-xl bg-primary/50" />
            <div className="h-5 w-1/3 rounded-xl bg-muted" />
          </div>
          <div className="flex justify-end">
            <div className="h-5 w-1/2 rounded-xl bg-primary/50" />
          </div>
        </div>
      </footer>
    </div>
  );
}
