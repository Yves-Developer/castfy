"use client";

import { useState } from "react";
import { ApiSettings, type AIProvider } from "@/features/playground/api-settings";
import { ExperimentTabs } from "@/features/playground/experiment-tabs";

export default function PlaygroundPage() {
  const [provider, setProvider] = useState<AIProvider>("anthropic");

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playground</h1>
        <p className="text-muted-foreground mt-2">
          Test the core Demosmith logic, inspect accessibility trees, and debug LLM generation in isolation.
        </p>
      </div>

      <div className="grid gap-8">
        <ApiSettings provider={provider} setProvider={setProvider} />
        <ExperimentTabs provider={provider} />
      </div>
    </div>
  );
}
