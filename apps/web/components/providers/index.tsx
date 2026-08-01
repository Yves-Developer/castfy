"use client";

import { Toaster } from "@castfy/ui/components/sonner";
import { TailwindIndicator } from "@castfy/ui/components/tailwind-indicator";
import { PostHogProvider } from "./posthog";
import { ThemeProvider } from "./theme-provider";
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <ThemeProvider>
        {children}
        <TailwindIndicator />
        <Toaster />
      </ThemeProvider>
    </PostHogProvider>
  );
}
