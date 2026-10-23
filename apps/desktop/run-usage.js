import fs from 'node:fs/promises';
import path from 'node:path';

/** Kept with the recording it made, so reopening a demo still shows it. */
export const RUN_USAGE_FILE = 'run-usage.json';

/**
 * What a Claude Code run reports about itself. With `-p --output-format json`
 * its stdout is one result object, not text: the agent's last message is in
 * `result`, and next to it the turns, the time, and the tokens by model.
 *
 * Returns the message and the usage, or null when stdout is not that object
 * (an older CLI, or a crash before it printed one); the caller then treats
 * stdout as text, as before.
 */
export function readClaudeResult(stdout) {
  const result = parseLastObject(stdout);
  if (result?.type !== 'result') return null;
  const models = Object.entries(result.modelUsage ?? {});
  const sum = (key) => models.reduce((total, [, usage]) => total + (Number(usage[key]) || 0), 0);
  return {
    text: typeof result.result === 'string' ? result.result : '',
    isError: Boolean(result.is_error),
    usage: {
      agent: 'claude-code',
      turns: result.num_turns ?? null,
      durationMs: result.duration_ms ?? null,
      models: models.map(([name]) => name),
      inputTokens: sum('inputTokens'),
      outputTokens: sum('outputTokens'),
      cacheReadTokens: sum('cacheReadInputTokens'),
      cacheWriteTokens: sum('cacheCreationInputTokens'),
    },
  };
}

/** The last line of `text` that is a JSON object, parsed; null if none is. */
function parseLastObject(text) {
  const lines = text.trim().split('\n').reverse();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('{')) continue;
    try {
      return JSON.parse(trimmed);
    } catch {
      // Not the result line; keep looking.
    }
  }
  return null;
}

/** Saves a run's usage next to its recording. */
export async function saveRunUsage(sessionDir, usage) {
  await fs.writeFile(path.join(sessionDir, RUN_USAGE_FILE), JSON.stringify(usage, null, 2));
}
