import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { appConfigDir } from './platform.js';

/**
 * Every client stores MCP servers somewhere different, but the payload is the
 * same three things: a command, its args, and the env that pins
 * CASTFY0_OUTPUT_DIR and the browser folder. Paths are written with forward slashes — node accepts them
 * on Windows, and it avoids escaping backslashes differently in JSON vs TOML.
 */
const home = os.homedir();
const posix = (p) => p.split(path.sep).join('/');

export const CLIENTS = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    kind: 'json',
    file: path.join(home, '.claude.json'),
    install: {
      cli: true,
      command: 'npm install -g @anthropic-ai/claude-code',
      url: 'https://code.claude.com/docs',
      note: 'Terminal agent. Castfy can start recordings with it.',
    },
  },
  {
    id: 'claude-desktop',
    label: 'Claude Desktop',
    kind: 'json',
    file: path.join(appConfigDir(), 'Claude/claude_desktop_config.json'),
    requiresFile: true,
    install: {
      cli: false,
      url: 'https://claude.com/download',
      note: 'Desktop app. Ask it to record; Castfy cannot start runs itself.',
    },
  },
  {
    id: 'cursor',
    label: 'Cursor',
    kind: 'json',
    file: path.join(home, '.cursor/mcp.json'),
    requiresDir: path.join(home, '.cursor'),
    install: {
      cli: true,
      url: 'https://cursor.com',
      note: 'Editor. Its agent CLI is a separate install.',
    },
  },
  {
    id: 'codex',
    label: 'Codex',
    kind: 'toml',
    file: path.join(home, '.codex/config.toml'),
    requiresDir: path.join(home, '.codex'),
    install: {
      cli: true,
      command: 'npm install -g @openai/codex',
      url: 'https://developers.openai.com/codex/cli',
      note: 'Terminal agent. Castfy can start recordings with it.',
    },
  },
];

async function readIfExists(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * Configs are written by hand as often as by us, so the same file shows up as
 * C:\a\b and C:/a/b. Compare resolved, slash-normalised, case-folded paths —
 * Windows filenames are case-insensitive, and a false mismatch here would tell
 * the user they are disconnected when they are not.
 */
function samePath(a, b) {
  if (!a || !b) return false;
  const norm = (p) => posix(path.resolve(p)).toLowerCase();
  return norm(a) === norm(b);
}

/**
 * "Connected" is not just "an entry exists". The Cursor entry on this machine
 * pointed at a launcher script that had since been deleted — a registration
 * whose entrypoint is gone is worse than none, because the client reports a
 * broken server rather than a missing one. That case reports as `stale`.
 */
async function inspect(client, expected, cliInstalled) {
  const { mcpEntry, launch, browsersPath } = expected;
  // A CLI installed but never run has no config folder yet (~/.codex appears
  // on first run); connecting creates it.
  const installed =
    cliInstalled.has(client.id) ||
    (client.requiresDir
      ? await exists(client.requiresDir)
      : client.requiresFile
        ? await exists(client.file)
        : true);
  if (!installed) return { status: 'absent' };

  const raw = await readIfExists(client.file);
  if (raw === null) return { status: 'disconnected' };

  if (client.kind === 'json') {
    let cfg;
    try {
      cfg = JSON.parse(raw);
    } catch {
      return { status: 'unreadable' };
    }
    const srv = cfg.mcpServers?.castfy0;
    if (!srv) return { status: 'disconnected' };

    const entryPath = srv.args?.find((a) => a.endsWith('.js') || a.endsWith('.mjs')) ?? null;
    if (entryPath && !(await exists(entryPath))) return { status: 'stale', entryPath };
    // An absolute command that has gone away is an app that was moved or
    // uninstalled; the client would fail to start the server at all.
    if (path.isAbsolute(srv.command ?? '') && !(await exists(srv.command))) {
      return { status: 'stale', entryPath };
    }
    if (!srv.env?.CASTFY0_OUTPUT_DIR) return { status: 'needs-env', entryPath };
    if (!samePath(entryPath, mcpEntry)) return { status: 'other-entry', entryPath };
    // Registered before this build: right server, but launched the old way or
    // without the browser folder, so a recording would fail to find Chromium.
    // The command is written with forward slashes (see posix): compared as
    // text with Windows' C:\…\Castfy.exe it never matched, so a fresh
    // connect read as "Needs reconnecting" and onboarding could not finish.
    const sameCommand = path.isAbsolute(launch.command)
      ? samePath(srv.command, launch.command)
      : srv.command === launch.command;
    const outdated =
      !sameCommand || !samePath(srv.env?.PLAYWRIGHT_BROWSERS_PATH, browsersPath);
    return { status: outdated ? 'needs-env' : 'connected', entryPath };
  }

  // TOML: a shallow probe, enough to tell registered from not.
  if (!/^\s*\[mcp_servers\.castfy0\]/m.test(raw)) return { status: 'disconnected' };
  const m = raw.match(/^\s*\[mcp_servers\.castfy0\][\s\S]*?args\s*=\s*\[([^\]]*)\]/m);
  const entryPath = m ? m[1].replace(/["'\s]/g, '') : null;
  if (entryPath && !(await exists(entryPath))) return { status: 'stale', entryPath };
  const hasEnv = /\[mcp_servers\.castfy0\.env\]/.test(raw);
  const hasBrowsers = raw.includes(`PLAYWRIGHT_BROWSERS_PATH = "${posix(browsersPath)}"`);
  return { status: hasEnv && hasBrowsers ? 'connected' : 'needs-env', entryPath };
}

/**
 * @param expected      What a correct registration looks like for this install:
 *                      { mcpEntry, launch: { command, env }, browsersPath }.
 * @param cliInstalled  Ids of the clients whose CLI was found (agents.js).
 */
export async function detectClients(expected, cliInstalled = new Set()) {
  return Promise.all(
    CLIENTS.map(async (c) => ({
      id: c.id,
      label: c.label,
      file: c.file,
      install: c.install ?? null,
      ...(await inspect(c, expected, cliInstalled)),
    }))
  );
}

/** The env every registration carries, whichever client it is for. */
function serverEnv({ outputDir, browsersPath, launch }) {
  return {
    ...launch.env,
    CASTFY0_OUTPUT_DIR: posix(outputDir),
    PLAYWRIGHT_BROWSERS_PATH: posix(browsersPath),
  };
}

function serverBlockJson(opts) {
  return {
    type: 'stdio',
    command: posix(opts.launch.command),
    args: [posix(opts.mcpEntry)],
    env: serverEnv(opts),
  };
}

/**
 * Deliberately writes no per-tool approval settings.
 *
 * An earlier version wrote approval_mode = "allow" for all twenty tools,
 * guessing at an undocumented enum. Codex accepts only auto/prompt/writes/
 * approve, so the file stopped parsing — which broke Codex entirely, not just
 * Castfy. Approval belongs to how a run is invoked, not to a config file we
 * write opinions into on someone's behalf.
 */
function serverBlockToml(opts) {
  const envLines = Object.entries(serverEnv(opts)).map(([k, v]) => `${k} = "${v}"`);
  return [
    '[mcp_servers.castfy0]',
    `command = "${posix(opts.launch.command)}"`,
    `args = ["${posix(opts.mcpEntry)}"]`,
    'enabled = true',
    'startup_timeout_sec = 60',
    'tool_timeout_sec = 600',
    '',
    '[mcp_servers.castfy0.env]',
    ...envLines,
    '',
  ].join('\n');
}

/**
 * Claude Code reads permissions from ~/.claude/settings.json. The server-scoped
 * token `mcp__castfy0` covers every tool the server exposes, so this survives
 * castfy0 gaining new tools without needing to be re-written.
 */
async function allowInClaudeSettings() {
  const file = path.join(home, '.claude/settings.json');
  await fs.mkdir(path.dirname(file), { recursive: true });
  const raw = await readIfExists(file);
  if (raw !== null) await fs.writeFile(`${file}.castfy-backup`, raw, 'utf8');

  let cfg = {};
  if (raw) {
    try {
      cfg = JSON.parse(raw);
    } catch {
      throw new Error(`${file} is not valid JSON — not overwriting it`);
    }
  }
  cfg.permissions = cfg.permissions || {};
  cfg.permissions.allow = Array.from(new Set([...(cfg.permissions.allow || []), 'mcp__castfy0']));
  await fs.writeFile(file, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
  return file;
}

/**
 * Writes the castfy0 registration for one client. Backs the file up first —
 * .claude.json in particular holds a lot of unrelated state, and a bad write
 * there costs the user their whole config.
 */
/**
 * @param opts  { mcpEntry, outputDir, browsersPath, launch: { command, env } }
 */
export async function connectClient(id, opts) {
  const client = CLIENTS.find((c) => c.id === id);
  if (!client) throw new Error(`unknown client: ${id}`);

  await fs.mkdir(path.dirname(client.file), { recursive: true });
  const raw = await readIfExists(client.file);
  if (raw !== null) await fs.writeFile(`${client.file}.castfy-backup`, raw, 'utf8');

  if (client.kind === 'json') {
    const cfg = raw ? JSON.parse(raw) : {};
    cfg.mcpServers = cfg.mcpServers || {};
    cfg.mcpServers.castfy0 = serverBlockJson(opts);
    if (id === 'claude-code') {
      // Permissions do NOT live in .claude.json — that file holds servers and
      // project state. Writing them here looks like it worked and is silently
      // ignored, which is exactly how the first run still hit an approval wall.
      delete cfg.permissions;
    }
    await fs.writeFile(client.file, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
    if (id === 'claude-code') await allowInClaudeSettings();
    return { ok: true, file: client.file, backedUp: raw !== null };
  }

  // TOML: replace an existing castfy0 section wholesale, else append.
  const block = serverBlockToml(opts);
  let next;
  if (raw && /^\s*\[mcp_servers\.castfy0/m.test(raw)) {
    const stripped = raw.replace(
      /^[ \t]*\[mcp_servers\.castfy0[\s\S]*?(?=^[ \t]*\[(?!mcp_servers\.castfy0)|$(?![\s\S]))/gm,
      ''
    );
    next = `${stripped.trimEnd()}\n\n${block}`;
  } else {
    next = `${(raw || '').trimEnd()}\n\n${block}`;
  }
  await fs.writeFile(client.file, next, 'utf8');
  return { ok: true, file: client.file, backedUp: raw !== null };
}

/**
 * Removes the castfy0 registration from one client.
 *
 * Deliberately surgical: only our own entry goes, and only from the section it
 * lives in. A user's other MCP servers, and everything else in these files, are
 * left exactly as they were — these are the same configs their editor depends
 * on to start.
 */
export async function disconnectClient(id) {
  const client = CLIENTS.find((c) => c.id === id);
  if (!client) throw new Error(`unknown client: ${id}`);

  const raw = await readIfExists(client.file);
  if (raw === null) return { ok: true, changed: false, file: client.file };

  await fs.writeFile(`${client.file}.castfy-backup`, raw, 'utf8');

  if (client.kind === 'json') {
    let cfg;
    try {
      cfg = JSON.parse(raw);
    } catch {
      throw new Error(`${client.file} is not valid JSON — not touching it`);
    }
    if (!cfg.mcpServers?.castfy0) return { ok: true, changed: false, file: client.file };

    delete cfg.mcpServers.castfy0;
    await fs.writeFile(client.file, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');

    // The allowlist lives in a different file for Claude Code, so leaving it
    // behind would keep granting a server that no longer exists.
    if (id === 'claude-code') await revokeInClaudeSettings();

    return { ok: true, changed: true, file: client.file };
  }

  // TOML: drop every [mcp_servers.castfy0*] section, keep the rest verbatim.
  if (!/^[ \t]*\[mcp_servers\.castfy0/m.test(raw)) {
    return { ok: true, changed: false, file: client.file };
  }
  const stripped = raw.replace(
    /^[ \t]*\[mcp_servers\.castfy0[\s\S]*?(?=^[ \t]*\[(?!mcp_servers\.castfy0)|$(?![\s\S]))/gm,
    ''
  );
  await fs.writeFile(client.file, `${stripped.trimEnd()}\n`, 'utf8');
  return { ok: true, changed: true, file: client.file };
}

/** Drops the mcp__castfy0 grant when Claude Code is disconnected. */
async function revokeInClaudeSettings() {
  const file = path.join(home, '.claude/settings.json');
  const raw = await readIfExists(file);
  if (raw === null) return;

  let cfg;
  try {
    cfg = JSON.parse(raw);
  } catch {
    return;
  }
  const allow = cfg.permissions?.allow;
  if (!Array.isArray(allow)) return;

  const next = allow.filter((entry) => entry !== 'mcp__castfy0');
  if (next.length === allow.length) return;

  await fs.writeFile(`${file}.castfy-backup`, raw, 'utf8');
  cfg.permissions.allow = next;
  await fs.writeFile(file, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');
}
