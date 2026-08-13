"use client";

import { Toaster } from "@castfy/ui/components/sonner";
import { TooltipProvider } from "@castfy/ui/components/tooltip";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Disconnected from "@/features/app/_layout/disconnected";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TooltipProvider>
      <Toaster />
      <Disconnected />
    </ThemeProvider>
  );
}
