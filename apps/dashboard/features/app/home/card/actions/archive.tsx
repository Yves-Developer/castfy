"use client";
import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@castfy/ui/components/dialog";
import type * as React from "react";

export function ArchiveDemo({
  open,
  openChangeAction,
}: {
  open: boolean;
  openChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Dialog onOpenChange={openChangeAction} open={open}>
      <DialogContent className="sm:max-w-68" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xs">
            Archive Demo
          </DialogTitle>
          <DialogDescription className="sr-only">
            Archive demo
          </DialogDescription>
        </DialogHeader>

        <p className="text-muted-foreground text-xs">
          This will move the demo to the archive folder. You can restore it
          later from the archive.
        </p>
        <div className="flex items-center gap-2">
          <DialogClose asChild>
            <Button className="flex-1 text-xs" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1 text-xs"
            type="submit"
            variant="destructive"
          >
            Archive Demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
