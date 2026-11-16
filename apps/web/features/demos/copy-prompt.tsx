"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

/** The prompt the agent was given, with a button that copies it. */
export function CopyPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      .writeText(prompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => undefined);
  };
  return (
    <div className="relative rounded-xl border bg-secondary/60 p-5 pr-24">
      <p className="font-mono text-[13px] leading-6">{prompt}</p>
      <button
        className="absolute top-4 right-4 inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 font-medium text-[13px] hover:bg-secondary"
        onClick={copy}
        type="button"
      >
        {copied ? (
          <CheckIcon className="size-3.5" />
        ) : (
          <CopyIcon className="size-3.5" />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
