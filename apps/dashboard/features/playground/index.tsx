"use client";

import { useState } from "react";
import type { AIProvider } from "./api-settings";
import { ApiSettings } from "./api-settings";
import { ExperimentTabs } from "./experiment-tabs";

export function PlaygroundIndex() {
  const [provider, setProvider] = useState<AIProvider>("anthropic");

  return (
    <div className="grid gap-8">
      <ApiSettings provider={provider} setProvider={setProvider} />
      <ExperimentTabs provider={provider} />
    </div>
  );
}
