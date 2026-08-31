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

export const AGENTS = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    /** First match wins. The native installer drops an .exe; npm leaves a .cmd. */
    binaries: [
      path.join(home, '.local/bin/claude.exe'),
      path.join(home, '.local/bin/claude'),
      path.join(appData, 'npm/claude.cmd'),
    ],
    /**
     * -p is headless. --allowedTools matters because a headless run cannot show
     * an approval prompt: an un-allowlisted tool call just stalls.
     */
    buildArgs: (prompt) => ['-p', prompt, '--allowedTools', 'mcp__castfy0'],
  },
  {
    id: 'codex',
    label: 'Codex',
    binaries: [
      path.join(appData, 'npm/codex.cmd'),
      path.join(home, '.codex/bin/codex.exe'),
      'codex',
    ],
    /** `codex exec` is its non-interactive mode. */
    buildArgs: (prompt) => ['exec', prompt],
  },
  {
    id: 'cursor',
    label: 'Cursor',
    binaries: [path.join(home, '.local/bin/cursor-agent.exe'), 'cursor-agent'],
    buildArgs: (prompt) => ['-p', prompt],
  },
];

/** GUI-only clients: connectable, never drivable. */
export const GUI_ONLY = new Set(['claude-desktop']);

async function onPath(name) {
  const dirs = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  const exts = (process.env.PATHEXT || '.EXE;.CMD;.BAT').split(';').filter(Boolean);
  for (const dir of dirs) {
    for (const ext of ['', ...exts]) {
      const candidate = path.join(dir, name + ext);
      try {
        await fs.access(candidate);
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
      await fs.access(candidate);
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

/** Command line for a run, or null when that agent cannot be driven. */
export async function buildCommand(agentId, prompt) {
  const agent = AGENTS.find((a) => a.id === agentId);
  if (!agent) return null;
  const binary = await resolveBinary(agentId);
  if (!binary) return null;
  return { binary, args: agent.buildArgs(prompt), label: agent.label };
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
