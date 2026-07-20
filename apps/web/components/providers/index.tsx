"use client";

import { Toaster } from "@castfy/ui/components/sonner";
import { TailwindIndicator } from "@castfy/ui/components/tailwind-indicator";
import { ThemeProvider } from "./theme-provider";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <TailwindIndicator />
      <Toaster />
    </ThemeProvider>
  );
}
