import { execFile } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

/**
 * Everything that differs between Windows, macOS and Linux, in one place.
 *
 * The app was built on Windows first, and the rest of the code had quietly
 * assumed it: %APPDATA% for Claude Desktop, `node` on PATH, `taskkill` to stop a
 * run. Each of those is a one-liner that breaks a whole feature on a Mac.
 */

export const isWindows = process.platform === 'win32';
export const isMac = process.platform === 'darwin';

const home = os.homedir();

/** Where the OS keeps per-user application config. */
export function appConfigDir() {
  if (isWindows) return process.env.APPDATA || path.join(home, 'AppData/Roaming');
  if (isMac) return path.join(home, 'Library/Application Support');
  return process.env.XDG_CONFIG_HOME || path.join(home, '.config');
}

/**
 * Gives a GUI-launched app the PATH a terminal would have.
 *
 * Opened from the Dock or Finder, a macOS app inherits launchd's PATH —
 * /usr/bin:/bin:/usr/sbin:/sbin — which has none of /opt/homebrew/bin,
 * ~/.local/bin or an nvm node. Every agent CLI lives in one of those, so without
 * this the app reports "no agent installed" on a machine where `claude` works
 * fine in Terminal. Linux desktop launchers have the same problem, less often.
 *
 * Asks the user's login shell once, at startup, and merges its PATH in front.
 * Never throws: a slow or broken shell profile must not stop the app opening.
 */
export async function adoptLoginShellPath() {
  if (isWindows) return;

  const shell = process.env.SHELL || (isMac ? '/bin/zsh' : '/bin/bash');
  const marker = '__CASTFY_PATH__';

  const shellPath = await new Promise((resolve) => {
    execFile(
      shell,
      ['-ilc', `printf '${marker}%s${marker}' "$PATH"`],
      { timeout: 5000, env: { ...process.env, DISABLE_AUTO_UPDATE: 'true' } },
      (err, stdout) => {
        if (err) return resolve(null);
        // Profiles print banners; only trust what sits between the markers.
        const match = String(stdout).split(marker);
        resolve(match.length >= 3 ? match[1] : null);
      }
    );
  });

  // Common install locations, in case the profile does not add them either.
  const fallbacks = [
    path.join(home, '.local/bin'),
    path.join(home, '.claude/local'),
    '/opt/homebrew/bin',
    '/usr/local/bin',
  ];

  const parts = [
    ...(shellPath ? shellPath.split(path.delimiter) : []),
    ...(process.env.PATH || '').split(path.delimiter),
    ...fallbacks,
  ].filter(Boolean);

  process.env.PATH = Array.from(new Set(parts)).join(path.delimiter);
}

/**
 * How an MCP client should start the bundled castfy0 server.
 *
 * Registering `node` assumed the user has Node.js, which the native Claude Code
 * installer does not need — so a fresh Mac could connect and then fail on the
 * first recording. A packaged build instead runs the server with Castfy's own
 * executable in Node mode: the runtime the server needs ships with the app.
 *
 * Development keeps `node`, because there process.execPath is the Electron
 * binary inside node_modules and would churn every time dependencies change.
 */
export function mcpLaunch({ packaged, execPath }) {
  if (!packaged) return { command: 'node', env: {} };
  return { command: execPath, env: { ELECTRON_RUN_AS_NODE: '1' } };
}

/**
 * Stops an agent run and everything it started.
 *
 * The agent spawns the MCP server, which spawns Chromium and ffmpeg. Signalling
 * only the agent orphans the browser, which keeps recording into a file nobody
 * will read. Windows needs taskkill's tree kill; elsewhere the run is started as
 * its own process group (see `spawnOptionsForRun`) so the whole group can be
 * signalled at once.
 */
export function killRunTree(child, spawnFn) {
  if (!child?.pid) return;
  if (isWindows) {
    spawnFn('taskkill', ['/pid', String(child.pid), '/f', '/t']);
    return;
  }
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    // The group is already gone, or was never created; fall back to the child.
    child.kill('SIGTERM');
  }
}

/** Spawn options that make `killRunTree` able to reach every descendant. */
export function spawnOptionsForRun() {
  return isWindows ? { windowsHide: true } : { detached: true };
}
