"use client";
import { Button } from "@castfy/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@castfy/ui/components/dialog";
import { useMediaQuery } from "@castfy/ui/hooks/use-media-query";
import { cn } from "@castfy/ui/lib/utils";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

export function ResponsiveDialog({
  trigger,
  children,
  title,
  description,
  showCancel = true,
  showDrawerTitle,
  submitBtn,
  isSubmitting,
  open,
  setOpenAction,
}: {
  trigger?: {
    desktop: ReactElement;
    mobile: ReactElement;
  };
  children: React.ReactNode;
  title: string;
  description?: string;
  showCancel?: boolean;
  showDrawerTitle?: boolean;
  submitBtn: React.ReactNode;
  isSubmitting?: boolean;
  open: boolean;
  setOpenAction: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  if (isDesktop) {
    return (
      <Dialog onOpenChange={setOpenAction} open={open}>
        {trigger && (
          <DialogTrigger asChild className="hidden lg:flex">
            {trigger.desktop}
          </DialogTrigger>
        )}
        <DialogContent className="hidden md:max-w-lg lg:grid lg:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          <DialogFooter>
            {showCancel && (
              <DialogClose asChild>
                <Button disabled={isSubmitting} variant="outline">
                  Cancel
                </Button>
              </DialogClose>
            )}
            {submitBtn}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <Drawer onOpenChange={setOpenAction} open={open}>
      {trigger && (
        <DrawerTrigger asChild className="lg:hidden">
          {trigger.mobile}
        </DrawerTrigger>
      )}
      <DrawerContent className="lg:hidden">
        <DrawerHeader className={cn(showDrawerTitle ? "" : "sr-only")}>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        {children}
        <DrawerFooter className="flex w-full flex-row items-center justify-between">
          {showCancel && (
            <DrawerClose asChild>
              <Button disabled={isSubmitting} variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          )}
          {submitBtn}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
