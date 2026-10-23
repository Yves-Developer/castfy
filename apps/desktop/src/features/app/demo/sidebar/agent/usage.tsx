import type { RunUsage } from "@/lib/bridge";

/** 1234 → "1.2k", 2_400_000 → "2.4M". */
function compact(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
}

/** 222_000 → "3m 42s". */
function duration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

/**
 * What the agent's run used: turns, tokens and time, from the agent's own
 * report. Tokens rather than a price: on a subscription the agent's dollar
 * figure is what the same use would cost on the API, not what was charged.
 */
export function RunUsageLine({ usage }: { usage: RunUsage }) {
  const total =
    usage.inputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  const parts = [
    usage.turns ? `${usage.turns} turns` : null,
    total > 0 ? `${compact(total)} tokens` : null,
    usage.durationMs ? duration(usage.durationMs) : null,
  ].filter(Boolean);
  if (parts.length === 0) {
    return null;
  }
  const breakdown = [
    `Input ${compact(usage.inputTokens)}`,
    `output ${compact(usage.outputTokens)}`,
    `cache read ${compact(usage.cacheReadTokens)}`,
    `cache write ${compact(usage.cacheWriteTokens)}`,
    usage.models.length > 0 ? `model ${usage.models.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <p className="mt-1 text-[11px] text-muted-foreground" title={breakdown}>
      {parts.join(" · ")}
    </p>
  );
}
