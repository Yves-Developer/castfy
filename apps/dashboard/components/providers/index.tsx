"use client";

import { TailwindIndicator } from "@workspace/ui/components/tailwind-indicator";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <TailwindIndicator />
    </ThemeProvider>
  );
}
