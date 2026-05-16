"use client"

import { TailwindIndicator } from "@workspace/ui/components/tailwind-indicator"
import { ThemeProvider } from "./theme-provider"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <TailwindIndicator />
    </ThemeProvider>
  )
}
