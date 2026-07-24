"use client";

import { Toaster } from "@castfy/ui/components/sonner";
import { TooltipProvider } from "@castfy/ui/components/tooltip";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
      {/* <TailwindIndicator /> */}
    </ThemeProvider>
  );
}
