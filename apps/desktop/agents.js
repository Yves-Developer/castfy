import { constants as fsConstants } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { readClaudeResult } from './run-usage.js';

/**
 * The agents Castfy can drive.
 *
 * "Connected" and "drivable" are different things. Connecting registers the MCP
 * so a client *can* record when you ask it. Driving means Castfy starts the run
 * itself, which needs a headless CLI — so Claude Desktop, being GUI-only, is
 * never drivable no matter how well it is connected.
 */

const home = os.homedir();
const appData = process.env.APPDATA || path.join(home, 'AppData/Roaming');

/** Outside Windows a file on PATH only counts if it can actually be executed. */
const RUNNABLE = process.platform === 'win32' ? fsConstants.F_OK : fsConstants.X_OK;

export const AGENTS = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    /**
     * First match wins. The native installer drops an .exe on Windows and a
     * binary in ~/.local/bin elsewhere; npm leaves a .cmd shim on Windows; the
     * older "local" install lives under ~/.claude/local. A bare name is looked
     * up on PATH, which on macOS is the login shell's (see platform.js).
     */
    binaries: [
      path.join(home, '.local/bin/claude.exe'),
      path.join(home, '.local/bin/claude'),
      path.join(appData, 'npm/claude.cmd'),
      path.join(home, '.claude/local/claude'),
      '/opt/homebrew/bin/claude',
      '/usr/local/bin/claude',
      'claude',
    ],
    /**
     * -p is headless, and the prompt arrives on stdin. --allowedTools matters
     * because a headless run cannot show an approval prompt: an un-allowlisted
     * tool call just stalls.
     *
     * stream-json (which needs --verbose with -p) prints each message, tool
     * call and result as it happens, for the studio's Agent view
     * (agent-events.js), and still ends with the result object that carries
     * the run's turns, time, tokens and cost (run-usage.js).
     *
     * --model takes Claude Code's aliases (opus, sonnet, haiku) or a full id;
     * without it the user's own Claude Code setting decides.
     *
     * With a run config (writeRunMcpConfig), castfy0 comes from it and only
     * from it: the recorder is there even when the user's own settings lack
     * it, and their other MCP servers cannot slow the run's start or fail it.
     */
    buildArgs: ({ mcpConfig, model } = {}) => [
      '-p',
      '--output-format',
      'stream-json',
      '--verbose',
      ...(model ? ['--model', model] : []),
      '--allowedTools',
      'mcp__castfy0',
      ...(mcpConfig ? ['--mcp-config', mcpConfig, '--strict-mcp-config'] : []),
    ],
    readResult: readClaudeResult,
    /** How its stdout becomes the Agent view's events (agent-events.js). */
    stream: 'claude',
  },
  {
    id: 'codex',
    label: 'Codex',
    binaries: [
      path.join(appData, 'npm/codex.cmd'),
      path.join(home, '.codex/bin/codex.exe'),
      '/opt/homebrew/bin/codex',
      '/usr/local/bin/codex',
      'codex',
    ],
    /**
     * `codex exec -` is non-interactive, reading the prompt from stdin.
     *
     * Unattended MCP use needs the bypass flag. In exec mode the approval policy
     * is "never", so any tool call fails with "requires approval, but approval
     * policy is never" — and nothing gentler lifts it: per-tool approval_mode is
     * ignored there, and --approve-for-me times out on its own review.
     *
     * It disables Codex's sandbox for the whole run, not just castfy0's tools,
     * so it stays off until someone turns it on.
     */
    buildArgs: ({ allowUnsandboxed } = {}) =>
      allowUnsandboxed
        ? ['exec', '--dangerously-bypass-approvals-and-sandbox', '-']
        : ['exec', '-'],
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    /**
     * The install script puts it in ~/.opencode/bin; npm, bun and Homebrew in
     * their own bin folders; otherwise it is looked up on PATH.
     */
    binaries: [
      path.join(home, '.opencode/bin/opencode.exe'),
      path.join(home, '.opencode/bin/opencode'),
      path.join(appData, 'npm/opencode.cmd'),
      path.join(home, '.bun/bin/opencode'),
      path.join(home, 'scoop/shims/opencode.exe'),
      '/opt/homebrew/bin/opencode',
      '/usr/local/bin/opencode',
      'opencode',
    ],
    /**
     * `opencode run` with no message reads the prompt from stdin. --format
     * json prints one event per line (agent-events.js OpenCodeStream).
     * Errors from the model (a used-up free tier, a bad key) are only
     * logged, so the run prints its ERROR log lines to stderr, where main.js
     * watches for them: OpenCode keeps waiting after one instead of exiting.
     *
     * castfy0 and its permission come from OPENCODE_CONFIG_CONTENT, set per
     * run (main.js), not from the user's own config.
     */
    buildArgs: ({ model } = {}) => [
      'run',
      '--format',
      'json',
      '--print-logs',
      '--log-level',
      'ERROR',
      ...(model ? ['--model', model] : []),
    ],
    stream: 'opencode',
  },
  {
    id: 'cursor',
    label: 'Cursor',
    binaries: [
      path.join(home, '.local/bin/cursor-agent.exe'),
      path.join(home, '.local/bin/cursor-agent'),
      'cursor-agent',
    ],
    buildArgs: () => ['-p'],
  },
];

/** Model names an agent's --model can take: aliases, ids, provider/model. */
const MODEL_NAME = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,79}$/;

/** The model saved for an agent, if it is one we can safely pass on. */
export function modelFor(settingsState, agentId) {
  const model = settingsState?.agentModels?.[agentId];
  return typeof model === 'string' && MODEL_NAME.test(model) ? model : null;
}

/** GUI-only clients: connectable, never drivable. */
export const GUI_ONLY = new Set(['claude-desktop']);

async function onPath(name) {
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  // Executable extensions are a Windows idea; elsewhere the bare name is the file.
  const exts =
    process.platform === 'win32'
      ? (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').filter(Boolean)
      : [];
  for (const dir of dirs) {
    for (const ext of ['', ...exts]) {
      const candidate = path.join(dir, name + ext);
      try {
        await fs.access(candidate, RUNNABLE);
        return candidate;
      } catch {
        // keep looking
      }
    }
  }
  return null;
}

/** Absolute path to an agent's CLI, or null when it is not installed. */
export async function resolveBinary(agentId) {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return null;

  for (const candidate of agent.binaries) {
    if (!path.isAbsolute(candidate)) {
      const found = await onPath(candidate);
      if (found) return found;
      continue;
    }
    try {
      await fs.access(candidate, RUNNABLE);
      return candidate;
    } catch {
      // keep looking
    }
  }
  return null;
}

/** Every agent with whether Castfy can actually start a run with it. */
export async function detectAgents() {
  return Promise.all(
    AGENTS.map(async (agent) => ({
      id: agent.id,
      label: agent.label,
      binary: await resolveBinary(agent.id),
    })).map(async (p) => {
      const row = await p;
      return { ...row, drivable: Boolean(row.binary) };
    })
  );
}

/**
 * Command line for a run, or null when that agent cannot be driven.
 *
 * The prompt is not here on purpose — every agent reads it from stdin, so it
 * never passes through argument parsing or a shell.
 */
export async function buildCommand(agentId, options = {}) {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return null;
  const binary = await resolveBinary(agentId);
  if (!binary) return null;
  return {
    binary,
    args: agent.buildArgs(options),
    label: agent.label,
    readResult: agent.readResult ?? null,
    stream: agent.stream ?? 'text',
  };
}

/**
 * Falls back to any installed agent when the chosen one is gone — an uninstall
 * should not leave the Run button permanently broken.
 */
export async function pickAgent(preferredId) {
  if (preferredId) {
    const binary = await resolveBinary(preferredId);
    if (binary) return preferredId;
  }
  for (const agent of AGENTS) {
    if (await resolveBinary(agent.id)) return agent.id;
  }
  return null;
}
