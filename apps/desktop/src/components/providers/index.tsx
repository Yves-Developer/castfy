"use client";

import { Toaster } from "@castfy/ui/components/sonner";
import { TooltipProvider } from "@castfy/ui/components/tooltip";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import Disconnected from "@/features/app/_layout/disconnected";
import { Settings } from "@/features/app/_shared/settings";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <NuqsAdapter>{children}</NuqsAdapter>
      </TooltipProvider>
      <Toaster />
      <Disconnected />
      <Settings />
    </ThemeProvider>
  );
}
