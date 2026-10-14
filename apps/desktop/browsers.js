import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * The browsers Castfy records and renders with.
 *
 * Chromium is ~150 MB per platform, so it does not ship inside the installer.
 * It is downloaded once, on first run, into the app's own data folder — the same
 * folder the recording engine and the exporter both read, so there is exactly
 * one copy and one version.
 *
 * The download is done by Playwright's own installer, from the copy bundled with
 * castfy0. That pins the browser to the revision that Playwright version was
 * built against, which is the only revision guaranteed to work with it.
 */

/** Browsers to install: Chromium records, the headless shell renders exports. */
const BROWSERS = ['chromium', 'chromium-headless-shell'];

/** Terminal colour codes, which Playwright writes even into a pipe. */
// biome-ignore lint/suspicious/noControlCharactersInRegex: matching ESC is the point.
const ANSI = /\u001b\[[0-9;]*m/g;

/** Written by Playwright into a browser folder once it is fully extracted. */
const COMPLETE_MARKER = 'INSTALLATION_COMPLETE';

/** Playwright's CLI inside a castfy0 install, found from the MCP entrypoint. */
export function playwrightCli(mcpEntry) {
  // <castfy0>/dist/index.js → <castfy0>/node_modules/playwright/cli.js
  return path.join(path.dirname(path.dirname(mcpEntry)), 'node_modules', 'playwright', 'cli.js');
}

/** Runs Playwright's CLI with this app's executable acting as Node. */
function runCli({ cli, args, browsersPath, onLine }) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        PLAYWRIGHT_BROWSERS_PATH: browsersPath,
      },
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    let pending = '';
    const take = (chunk) => {
      const text = chunk.toString();
      output += text;
      // Progress arrives as \r-rewritten lines when attached to a terminal and
      // as plain lines otherwise; treat both as line breaks.
      const lines = (pending + text).split(/\r|\n/);
      pending = lines.pop() ?? '';
      for (const line of lines) if (line.trim()) onLine?.(line.replace(ANSI, ''));
    };

    child.stdout.on('data', take);
    child.stderr.on('data', take);
    child.on('error', (err) => resolve({ code: -1, output: `${output}\n${err.message}` }));
    child.on('close', (code) => {
      if (pending.trim()) onLine?.(pending.replace(ANSI, ''));
      resolve({ code, output });
    });
  });
}

/** The folders a full install must contain, as Playwright itself reports them. */
async function expectedLocations({ cli, browsersPath }) {
  const { code, output } = await runCli({
    cli,
    args: ['install', '--dry-run', ...BROWSERS],
    browsersPath,
  });
  if (code !== 0) return null;
  const locations = [...output.matchAll(/Install location:\s+(.+)/g)].map((m) => m[1].trim());
  return Array.from(new Set(locations));
}

/**
 * Whether the browsers are ready.
 *
 * "Ready" means every folder Playwright would install into exists *and* carries
 * its completion marker. A folder without the marker is an interrupted download,
 * which would otherwise pass a plain existence check and fail at record time.
 */
export async function browserStatus({ mcpEntry, browsersPath }) {
  const cli = playwrightCli(mcpEntry);
  try {
    await fs.access(cli);
  } catch {
    return { ready: false, error: 'The recording engine is missing from this install.' };
  }

  const locations = await expectedLocations({ cli, browsersPath });
  if (!locations?.length) {
    return { ready: false, error: 'Could not work out which browser to install.' };
  }

  const missing = [];
  for (const dir of locations) {
    try {
      await fs.access(path.join(dir, COMPLETE_MARKER));
    } catch {
      missing.push(path.basename(dir));
    }
  }
  return { ready: missing.length === 0, missing, browsersPath };
}

let installing = null;

/**
 * Downloads the browsers, reporting progress as 0–100 across all of them.
 *
 * Only one install runs at a time; a second call joins the first rather than
 * starting a parallel download into the same folder.
 */
export function installBrowsers({ mcpEntry, browsersPath, onProgress }) {
  if (installing) return installing;

  const cli = playwrightCli(mcpEntry);
  // Chromium, the headless shell and Playwright's ffmpeg: three downloads.
  const DOWNLOADS = 3;
  let finished = 0;
  let label = 'Preparing download…';
  let lastPercent = -1;

  const report = (percent) => {
    const overall = Math.min(100, Math.round(((finished + percent / 100) / DOWNLOADS) * 100));
    if (overall === lastPercent) return;
    lastPercent = overall;
    onProgress?.({ percent: overall, label });
  };

  installing = (async () => {
    await fs.mkdir(browsersPath, { recursive: true });
    const { code, output } = await runCli({
      cli,
      args: ['install', ...BROWSERS],
      browsersPath,
      onLine: (line) => {
        const downloading = /^Downloading (.+?)(?: from |$)/.exec(line.trim());
        if (downloading) {
          label = `Downloading ${downloading[1].replace(/\s*\(playwright.*\)$/, '')}`;
          report(0);
          return;
        }
        if (/downloaded to/i.test(line)) {
          finished = Math.min(DOWNLOADS, finished + 1);
          report(0);
          return;
        }
        const percent = /(\d{1,3})%/.exec(line);
        if (percent) report(Number(percent[1]));
      },
    });

    if (code !== 0) return { ok: false, error: explainInstallFailure(output, code) };

    const status = await browserStatus({ mcpEntry, browsersPath });
    if (!status.ready) return { ok: false, error: 'The download finished but is incomplete.' };
    onProgress?.({ percent: 100, label: 'Ready' });
    return { ok: true };
  })().finally(() => {
    installing = null;
  });

  return installing;
}

/**
 * The one line of a failed install worth showing.
 *
 * Playwright prints the cause as "Error: …" followed by a stack trace; the tail
 * of the output is the stack, which tells the user nothing. A blocked host or a
 * dropped connection is the common case, and its own message says which.
 */
function explainInstallFailure(output, code) {
  const clean = output.replace(ANSI, '');
  const error = clean
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('Error:'));
  if (error) {
    const message = error.replace(/^Error:\s*/, '');
    const network = /ENOTFOUND|ECONNRESET|ETIMEDOUT|EAI_AGAIN|code 403|request blocked/i.test(message);
    return network
      ? `Could not reach the download server. Check your connection or proxy, then try again. (${message.slice(0, 200)})`
      : message.slice(0, 300);
  }
  return `The browser download failed (exit ${code}).`;
}

/**
 * The headless shell's executable inside one installed revision folder.
 *
 * Folder names follow Chrome for Testing's platform names, which changed over
 * Playwright releases; older revisions used chrome-linux/headless_shell.
 */
function headlessShellCandidates(revisionDir) {
  const exe = process.platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell';
  const platformDirs = {
    win32: ['chrome-headless-shell-win64', 'chrome-headless-shell-win32'],
    darwin:
      process.arch === 'arm64'
        ? ['chrome-headless-shell-mac-arm64', 'chrome-headless-shell-mac-x64']
        : ['chrome-headless-shell-mac-x64'],
    linux: ['chrome-headless-shell-linux64', 'chrome-headless-shell-linux-arm64'],
  }[process.platform] ?? [];

  const candidates = platformDirs.map((dir) => path.join(revisionDir, dir, exe));
  if (process.platform === 'linux') {
    candidates.push(path.join(revisionDir, 'chrome-linux', 'headless_shell'));
  }
  return candidates;
}

/** Playwright's default browser cache, used when the app's own one is empty. */
function defaultPlaywrightCache() {
  const home = process.env.HOME || process.env.USERPROFILE || '';
  if (process.platform === 'win32') {
    return path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  }
  if (process.platform === 'darwin') return path.join(home, 'Library/Caches/ms-playwright');
  return path.join(home, '.cache/ms-playwright');
}

/**
 * Remotion renders in Chrome Headless Shell. Playwright already installs one for
 * the recording engine, so pointing at it avoids a second download. Returns null
 * when none is found, which lets Remotion fall back to its own managed browser.
 */
export async function findHeadlessShell(browsersPath) {
  const roots = [browsersPath, process.env.PLAYWRIGHT_BROWSERS_PATH, defaultPlaywrightCache()]
    .filter(Boolean);

  for (const root of roots) {
    let entries = [];
    try {
      entries = await fs.readdir(root);
    } catch {
      continue;
    }
    const revisions = entries
      .filter((e) => e.startsWith('chromium_headless_shell-'))
      .sort((a, b) => Number(b.split('-')[1] || 0) - Number(a.split('-')[1] || 0));

    for (const revision of revisions) {
      for (const exe of headlessShellCandidates(path.join(root, revision))) {
        try {
          await fs.access(exe);
          return exe;
        } catch {
          // try the next candidate
        }
      }
    }
  }
  return null;
}
