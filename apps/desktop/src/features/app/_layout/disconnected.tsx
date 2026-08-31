"use client";

import { LoaderIcon } from "lucide-react";
import { useOffline } from "@/components/compat/offline";

export default function Disconnected() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }
  return (
    <div className="fixed bottom-10 left-1/2 z-50 flex w-full max-w-70 -translate-x-1/2 items-center gap-4 rounded-xl bg-background px-4 py-3 ring ring-foreground/10 md:max-w-sm">
      <LoaderIcon className="size-4 animate-spin duration-75" />
      <div className="flex items-center gap-1 font-semibold text-sm tracking-tight">
        <p>Reconnecting.</p>
        <p className="text-muted-foreground">Just a moment...</p>
      </div>
    </div>
  );
}
