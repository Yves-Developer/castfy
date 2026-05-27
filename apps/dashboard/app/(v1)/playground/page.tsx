"use client";

import { useState } from "react";
import { AppSiteHeader } from "@/features/_layout/app-header";
import {
  type AIProvider,
  ApiSettings,
} from "@/features/playground/api-settings";
import { ExperimentTabs } from "@/features/playground/experiment-tabs";

export default function PlaygroundPage() {
  const [provider, setProvider] = useState<AIProvider>("anthropic");

  return (
    <>
      <AppSiteHeader>
        <span className="text-sm">Playground</span>
      </AppSiteHeader>
      <div className="container max-w-5xl space-y-8 py-8">
        <div>
          <h1 className="font-medium text-2xl tracking-tight">Playground</h1>
          <p className="mt-2 text-muted-foreground">
            Test the core Demosmith logic, inspect accessibility trees, and
            debug LLM generation in isolation.
          </p>
        </div>

        <div className="grid gap-8">
          <ApiSettings provider={provider} setProvider={setProvider} />
          <ExperimentTabs provider={provider} />
        </div>
      </div>
    </>
  );
}
