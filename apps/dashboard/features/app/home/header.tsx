"use client";
import { Button } from "@castfy/ui/components/button";
import { Separator } from "@castfy/ui/components/separator";
import {
  BookmarkIcon,
  ChevronDownIcon,
  DownloadIcon,
  FolderIcon,
  Redo2Icon,
  Undo2Icon,
} from "lucide-react";
import { AiOutlineDiscord } from "react-icons/ai";
import { GiveFeedbackDialog } from "../_layout/give-feedback";
export default function AppHeader() {
  return (
    <header className="z-50 h-12.5 w-full border-b bg-background">
      <div className="flex h-12.5 w-full items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              className={"text-muted-foreground"}
              size="icon"
              variant={"ghost"}
            >
              <FolderIcon />
            </Button>
            <Button
              className={"text-muted-foreground"}
              size="icon"
              variant={"ghost"}
            >
              <AiOutlineDiscord />
            </Button>
            <GiveFeedbackDialog />
          </div>
          <Separator orientation="vertical" />
          <div className="flex items-center gap-1">
            <Button
              className={"text-muted-foreground"}
              size="icon"
              variant="secondary"
            >
              <Undo2Icon />
            </Button>
            <Button
              className={"text-muted-foreground"}
              size="icon"
              variant="ghost"
            >
              <Redo2Icon />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={"secondary"}>
            <BookmarkIcon />
            Presets
            <ChevronDownIcon />
          </Button>
          <Button>
            <DownloadIcon />
            Export
          </Button>
        </div>
      </div>
    </header>
  );
}
