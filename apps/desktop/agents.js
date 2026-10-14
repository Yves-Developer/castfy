import { constants as fsConstants } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

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
     */
    buildArgs: () => ['-p', '--allowedTools', 'mcp__castfy0'],
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
  return { binary, args: agent.buildArgs(options), label: agent.label };
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
