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
import { Loader2Icon } from "lucide-react";
import type * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { bridge } from "@/lib/bridge";
import type { Tdemo } from "@/types";

/**
 * Deletes a project. Its recording goes to the system Trash rather than off
 * the disk, so the dialog can say it is recoverable.
 */
export function DeleteDemo({
  demo,
  open,
  openChangeAction,
}: {
  demo: Tdemo;
  open: boolean;
  openChangeAction: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    const ok = await bridge.removeProject(demo.slug).catch(() => false);
    setBusy(false);
    if (ok) {
      openChangeAction(false);
      toast.success(`Deleted “${demo.name}”`);
    } else {
      toast.error("Could not delete that demo. Try again.");
    }
  };

  return (
    <Dialog onOpenChange={openChangeAction} open={open}>
      <DialogContent className="sm:max-w-72" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-semibold text-xs">
            Delete “{demo.name}”?
          </DialogTitle>
          <DialogDescription className="text-xs">
            The demo leaves your library, and its recording moves to the Trash,
            where you can still restore it.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <DialogClose asChild>
            <Button
              className="flex-1 text-xs"
              disabled={busy}
              variant="secondary"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="flex-1 text-xs"
            disabled={busy}
            onClick={remove}
            variant="destructive"
          >
            {busy ? (
              <Loader2Icon className="size-3.5 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
