import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { app, BrowserWindow, clipboard, ipcMain, net, protocol, shell } from 'electron';
import chokidar from 'chokidar';
import { buildCommand, detectAgents, pickAgent } from './agents.js';
import { browserStatus, installBrowsers } from './browsers.js';
import { connectClient, detectClients, disconnectClient } from './clients.js';
import { ProjectStore } from './projects.js';
import { ensureSourceVideo } from './ensure-source.js';
import { agentEnv, openLogin, signedIn } from './agent-auth.js';
import { PROGRESS_FILE, ProgressTail } from './progress.js';
import { RunStore, resolveUnfinished } from './runs.js';
import { SettingsStore } from './settings.js';
import { adoptLoginShellPath, killRunTree, mcpLaunch, spawnOptionsForRun } from './platform.js';
import { devtoolsEndpoint, openRecordingWindow, sanitizeInput } from './recording-window.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Export and re-cut load on first use, not at startup.
 *
 * export.js pulls in Remotion's bundler and renderer — rspack, esbuild and a
 * native compositor. Imported eagerly, any one of those failing to load took
 * the whole app down before a window opened; loaded here, the same failure is
 * an error on the Export button and everything else still works.
 */
const loadExport = () => import('./export.js');
const loadRecut = () => import('./recut.js');

/** Assigned once the app is ready and userData has a real path. */
let runs = new RunStore('');
let projects = new ProjectStore('');
let settings = new SettingsStore('');

/**
 * Name the app before anything reads a path: userData becomes %APPDATA%\Castfy,
 * so the library root below lands on exactly the folder the MCP writes into.
 */
app.setName('Castfy');

/**
 * Same resolution the MCP uses (castfy0 src/session/manager.ts). The two
 * processes never talk — agreeing on this directory IS the integration.
 */
function libraryRoot() {
  const configured = process.env.CASTFY0_OUTPUT_DIR?.trim();
  return configured ? path.resolve(configured) : path.join(app.getPath('userData'), 'recordings');
}

/**
 * Path to the MCP entrypoint the app registers into each client. In a packaged
 * build this becomes the bundled copy under process.resourcesPath; during the
 * spike it is the local castfy0 checkout. CASTFY0_MCP_ENTRY overrides both,
 * mirroring the escape hatch the server-side agent already uses.
 */
function mcpEntry() {
  const override = process.env.CASTFY0_MCP_ENTRY?.trim();
  if (override) return path.resolve(override);
  const bundled = path.join(process.resourcesPath || '', 'castfy0-mcp', 'dist', 'index.js');
  if (!app.isPackaged) {
    return path.resolve(dirname, '../../../castfy0/dist/index.js');
  }
  return bundled;
}

/**
 * The tools castfy0 exposes. Kept for reference and for allowlisting in clients
 * that support it — Codex is not one of them: in exec mode it ignores per-tool
 * approval settings entirely.
 */
const CASTFY0_TOOLS = [
  'castfy0_start',
  'castfy0_end',
  'castfy0_navigate',
  'castfy0_click',
  'castfy0_fill',
  'castfy0_select',
  'castfy0_hover',
  'castfy0_scroll',
  'castfy0_press_key',
  'castfy0_snapshot',
  'castfy0_screenshot',
  'castfy0_wait',
  'castfy0_assert',
  'castfy0_status',
  'castfy0_think_start',
  'castfy0_think_end',
  'castfy0_narration_plan',
  'castfy0_set_narration',
  'castfy0_exclude_step',
  'castfy0_mark_retake',
];

/**
 * What a correct castfy0 registration looks like for this install. Connecting
 * writes it; detection compares against it, so a registration made by an older
 * build reads as "needs reconnecting" instead of failing at record time.
 */
function expectedRegistration() {
  return {
    mcpEntry: mcpEntry(),
    outputDir: libraryRoot(),
    browsersPath: browsersPath(),
    launch: mcpLaunch({ packaged: app.isPackaged, execPath: process.execPath }),
  };
}

/**
 * Best variant first; the renderer plays the first one present.
 *
 * `source` sits below the finished variants on purpose. It is uncut footage, so
 * it must never win "show me the result" — but it is the untrimmed timeline the
 * editor measures cuts against, and editingSource() picks it there.
 */
const VIDEO_VARIANTS = [
  ['audioClean', 'demo-with-audio-clean.mp4'],
  ['audio', 'demo-with-audio.mp4'],
  ['clean', 'demo-clean.webm'],
  ['source', 'demo-source.mp4'],
  ['raw', 'demo.webm'],
  /**
   * The segment recorder's video. It is already the finished demo — nothing to
   * cut — and already seek-friendly H.264, so it stands in as the raw footage
   * the editor and every fallback read.
   */
  ['raw', 'demo.mp4'],
];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/**
 * A session directory is "complete" once steps.json exists — the packager writes
 * it at castfy0_end, so its presence is the signal that a run finished. Until
 * then the row shows as in-progress rather than being hidden, which is how you
 * see a recording appear live while the agent is still driving it.
 */
async function readSession(root, name) {
  const dir = path.join(root, name);
  const rec = { id: name, dir, title: name, status: 'recording', videos: {} };

  try {
    const meta = JSON.parse(await fs.readFile(path.join(dir, 'steps.json'), 'utf8'));
    rec.title = meta.title || name;
    rec.startUrl = meta.startUrl;
    rec.startedAt = meta.startedAt;
    rec.completedAt = meta.completedAt;
    rec.summary = meta.summary;
    rec.stepCount = meta.steps?.length ?? 0;
    rec.status = 'complete';
  } catch {
    // No steps.json yet: still running, or it died before packaging.
  }

  for (const [key, file] of VIDEO_VARIANTS) {
    if (rec.videos[key]) continue;
    if (await exists(path.join(dir, file))) {
      rec.videos[key] = `castfy://app/${MEDIA_PREFIX}${encodeURIComponent(name)}/${encodeURIComponent(file)}`;
    }
  }
  if (await exists(path.join(dir, 'guide.md'))) rec.guide = true;

  // Cover image: the first step screenshot the run captured. Free, already on
  // disk, and an actual frame of the demo rather than a generic placeholder.
  try {
    const shots = (await fs.readdir(path.join(dir, 'assets')))
      .filter((name2) => /\.(png|jpe?g|webp)$/i.test(name2))
      .sort();
    if (shots[0]) {
      rec.thumb = `castfy://app/${MEDIA_PREFIX}${encodeURIComponent(name)}/assets/${encodeURIComponent(shots[0])}`;
    }
  } catch {
    // No assets directory: a run that failed before its first screenshot.
  }

  const stat = await fs.stat(dir);
  rec.mtime = stat.mtimeMs;
  return rec;
}

async function scanLibrary() {
  const root = libraryRoot();
  let entries = [];
  try {
    entries = await fs.readdir(root, { withFileTypes: true });
  } catch {
    return { root, sessions: [], missing: true };
  }

  const sessions = await Promise.all(
    entries.filter((e) => e.isDirectory()).map((e) => readSession(root, e.name))
  );

  // Disk says whether a run finished; the run store says what happened to one
  // that did not. Without this a crashed run reads as "recording" forever.
  const bySession = runs.bySession();
  for (const session of sessions) {
    if (session.status === 'complete') continue;
    const resolved = resolveUnfinished(session, bySession.get(session.id));
    session.status = resolved.status;
    if (resolved.error) session.error = resolved.error;
  }

  sessions.sort((a, b) => b.mtime - a.mtime);
  return { root, sessions, missing: false };
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

function normaliseCuts(ranges) {
  return (ranges ?? []).map((c) => ({
    startMs: c.startMs,
    endMs: c.endMs,
    reason: c.reason ?? 'auto',
    stepIds: c.stepIds ?? [],
  }));
}

async function readTimeline(dir, steps) {
  const edits = await readJson(path.join(dir, 'edits.json'));
  const narration = await readJson(path.join(dir, 'narration.json'));

  const totalDurationMs =
    edits?.totalDurationMs ??
    narration?.totalDurationMs ??
    steps.reduce((end, s) => Math.max(end, (s.videoStartMs ?? 0) + (s.duration ?? 0)), 0);

  return {
    totalDurationMs,
/**
     * Two baselines, deliberately separate.
     *
     * aiCuts is the engine's original proposal, which recutSession preserves as
     * aiCutRanges the first time an edit is applied. appliedCuts is whatever the
     * clean video on disk was actually rendered from. Reading cutRanges for both
     * meant that after one Apply, "Reset to AI edit" restored the user's own
     * edit — the AI cut became unreachable while still sitting in the file.
     */
    aiCuts: normaliseCuts(edits?.aiCutRanges ?? edits?.cutRanges),
    appliedCuts: normaliseCuts(edits?.cutRanges),
    steps: steps
      .filter((s) => s.videoStartMs != null)
      .map((s) => ({
        id: s.id,
        action: s.action,
        description: s.description,
        startMs: s.videoStartMs,
        durationMs: s.duration ?? 0,
        excluded: Boolean(s.excludeFromFinal),
        failed: s.success === false,
      })),
    narration: (narration?.segments ?? []).map((seg) => ({
      stepId: seg.stepId,
      startMs: seg.startMs,
      endMs: seg.endMs,
      text: seg.text,
    })),
    zoom: await readZoomTrack(dir),
  };
}

/**
 * Where auto-zoom should move to, from the segment recorder's clicks and
 * hovers (segments.json). Null for recordings that have none.
 */
export async function readZoomTrack(dir) {
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(path.join(dir, 'segments.json'), 'utf8'));
  } catch {
    return null;
  }
  const events = (manifest?.segments ?? []).flatMap((s) => s.events ?? []);
  if (!manifest?.viewport || events.length === 0) return null;
  return { viewport: manifest.viewport, events };
}

async function getSession(id) {
  const root = libraryRoot();
  // Containment: the id reaches here from the renderer and is used as a path.
  const dir = path.resolve(root, id);
  if (dir === root || !dir.startsWith(root + path.sep)) return null;
  try {
    await fs.access(dir);
  } catch {
    return null;
  }

  const session = await readSession(root, path.basename(dir));
  if (session.status !== 'complete') {
    const resolved = resolveUnfinished(session, runs.bySession().get(session.id));
    session.status = resolved.status;
    if (resolved.error) session.error = resolved.error;
  }

  // Detail view extras the list does not need to carry.
  try {
    session.steps = JSON.parse(await fs.readFile(path.join(dir, 'steps.json'), 'utf8')).steps ?? [];
  } catch {
    session.steps = [];
  }

  /**
   * Everything the timeline draws, normalised into one shape.
   *
   * The clean cut is the engine's opinion about what to trim; surfacing its
   * ranges — with the reason each was made — is what lets someone disagree with
   * it. keepRanges are deliberately not carried: they are derived from cuts,
   * and having two editable copies of the same fact invites them to disagree.
   */
  session.timeline = await readTimeline(dir, session.steps);
  try {
    session.guideText = await fs.readFile(path.join(dir, 'guide.md'), 'utf8');
  } catch {
    session.guideText = null;
  }
  return session;
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'castfy',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);


const MIME_BY_EXT = {
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.vtt': 'text/vtt',
  '.srt': 'text/plain',
  '.json': 'application/json',
  '.md': 'text/markdown',
};

/**
 * Serves a file with byte-range support.
 *
 * Range handling is what makes video *seekable*. Without it the whole file comes
 * back with no Accept-Ranges, so the player can load and decode but cannot jump
 * — it kept showing the frame it first decoded while the timeline moved on.
 * Remotion asks for exact frames via media fragments (#t=12.4,12.43), and each
 * of those is a range request.
 */
async function serveMedia(absPath, rangeHeader) {
  const contentType = MIME_BY_EXT[path.extname(absPath).toLowerCase()] ?? 'application/octet-stream';

  let size;
  try {
    ({ size } = await fs.stat(absPath));
  } catch {
    return new Response('not found', { status: 404 });
  }

  const baseHeaders = {
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'no-cache',
  };

  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader ?? '');
  if (!match) {
    const whole = await fs.readFile(absPath);
    return new Response(whole, {
      status: 200,
      headers: { ...baseHeaders, 'Content-Length': String(size) },
    });
  }

  // An open-ended suffix range ("bytes=-500") counts back from the end.
  let start = match[1] === '' ? size - Number(match[2]) : Number(match[1]);
  let end = match[2] === '' || match[1] === '' ? size - 1 : Number(match[2]);

  start = Math.max(0, Math.min(start, size - 1));
  end = Math.max(start, Math.min(end, size - 1));

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return new Response('bad range', {
      status: 416,
      headers: { ...baseHeaders, 'Content-Range': `bytes */${size}` },
    });
  }

  const handle = await fs.open(absPath, 'r');
  try {
    const length = end - start + 1;
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, start);
    return new Response(buffer, {
      status: 206,
      headers: {
        ...baseHeaders,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(length),
      },
    });
  } finally {
    await handle.close();
  }
}


/**
 * Turns an agent's exit into something worth showing.
 *
 * Agents report their own conditions — usage limits, missing auth — on stdout,
 * not stderr, and exit 1 with an empty stderr. Reading only stderr produced a
 * bare "exit 1" for a situation the user could act on immediately.
 */
export function explainAgentFailure({ code, stdout = '', stderr = '' }) {
  const text = `${stdout}\n${stderr}`;

  const limit = text.match(/[^\n]*(?:session limit|usage limit|rate limit)[^\n]*/i);
  if (limit) {
    return {
      message: limit[0].trim(),
      hint: 'Recordings run on your own subscription, so this resets with it.',
    };
  }

  /**
   * Agents' own wording for a missing or expired sign-in. Deliberately not a
   * bare "authenticate" or "unauthorized": castfy0 has a castfy0_authenticate
   * tool, and a site under test can answer 401, and both read as "not signed
   * in" to a looser pattern.
   */
  if (
    /not logged in|please (?:run )?\/?login|failed to authenticate|oauth session expired|auth(?:entication)?_failed/i.test(
      text
    )
  ) {
    return {
      message: 'That agent is not signed in.',
      hint: 'Sign in to it, then try again.',
      needsLogin: true,
    };
  }

  /**
   * Agents relay provider errors as raw JSON, sometimes twice in one line. The
   * useful sentence is the "message" field; the envelope around it is noise.
   */
  const jsonMessage = text.match(/"message"\s*:\s*"([^"]+)"/);
  if (jsonMessage) {
    const message = jsonMessage[1].trim();
    const unsupportedModel = /model is not supported/i.test(message);
    return {
      message,
      hint: unsupportedModel
        ? 'Set a model your account can use in ~/.codex/config.toml, e.g. model = "gpt-5.6-terra"'
        : null,
    };
  }

  if (/approval policy is never|requires approval/i.test(text)) {
    return {
      message: 'Codex blocked the recording tools.',
      hint: 'Codex will not run tools unattended unless its sandbox is bypassed. Turn that on in Settings → Agents.',
    };
  }

  if (/unexpected argument|unrecognized|Usage:/i.test(text)) {
    return {
      message: 'The agent rejected the request.',
      hint: text.trim().split('\n').slice(0, 2).join(' ').slice(0, 200),
    };
  }

  // Nothing recognised: show whatever it actually said, from either stream.
  const tail = (stdout.trim() || stderr.trim()).split('\n').slice(-3).join(' ').slice(-300);
  return {
    message: tail || `The recording failed (exit ${code}).`,
    hint: null,
  };
}

/** Media lives under this prefix so the app and its recordings share an origin. */
const MEDIA_PREFIX = '__media/';

/** Refuses to serve anything that escapes `root`, however the path was built. */
function resolveWithin(root, relative) {
  const abs = path.resolve(root, relative);
  if (abs !== root && !abs.startsWith(root + path.sep)) return null;
  return abs;
}

/**
 * Serves the app from castfy://app/ instead of file://.
 *
 * This is not cosmetic. Over file:// a root-absolute path like
 * "/raycast/foo.webp" resolves against the drive root — the renderer really was
 * asking for C:\raycast\foo.webp — and the UI builds paths like that at
 * runtime, so no bundler setting can fix it. A custom scheme gives the page a
 * real origin, and those paths resolve inside the app again.
 *
 * Recordings are served from the same origin under __media/ rather than a
 * second host, so video requests are not cross-origin.
 */
function registerAppProtocol() {
  const rendererRoot = path.join(dirname, 'dist-renderer');

  protocol.handle('castfy', async (request) => {
    const url = new URL(request.url);
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');

    if (rel.startsWith(MEDIA_PREFIX)) {
      const abs = resolveWithin(libraryRoot(), rel.slice(MEDIA_PREFIX.length));
      if (!abs) return new Response('forbidden', { status: 403 });
      return serveMedia(abs, request.headers.get('range'));
    }

    // Anything else is a file from the built renderer.
    const abs = resolveWithin(rendererRoot, rel || 'index.html');
    if (!abs) return new Response('forbidden', { status: 403 });
    try {
      return await net.fetch(pathToFileURL(abs).toString());
    } catch {
      return new Response('not found', { status: 404 });
    }
  });
}

/** Reads "--flag value" from argv. */
function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : (process.argv[i + 1] ?? null);
}

/** Lets the app open straight onto a route, e.g. --route /setup. */
function startRoute() {
  const route = argValue('--route');
  return route ? `#${route.startsWith('/') ? route : `/${route}`}` : '';
}

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1180,
    height: 780,
    backgroundColor: '#0b0b0d',
    title: 'Castfy',
    webPreferences: { preload: path.join(dirname, 'preload.cjs') },
  });

  // Renderer errors otherwise only exist inside devtools, which is no help when
  // the window is being driven headlessly or by someone reporting a bug.
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    if (level < 2) return; // warnings and errors only
    const where = sourceId ? ` (${path.basename(sourceId)}:${line})` : '';
    console.error(`[renderer] ${message}${where}`);
  });
  win.webContents.on('render-process-gone', (_e, details) => {
    console.error('[renderer] process gone:', details.reason);
  });

  // Dev runs against Vite so the renderer hot-reloads; the packaged app loads
  // the build from disk.
  const devServer = process.env.CASTFY_DEV_SERVER;
  if (devServer) {
    win.loadURL(devServer);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    // Not loadFile: file:// would break every root-absolute asset path.
    win.loadURL(`castfy://app/index.html${startRoute()}`);
  }

  const shot = argValue('--shot');
  if (shot) {
    win.webContents.once('did-finish-load', async () => {
      // Wait for content, not just for load: the gate resolves asynchronously
      // and renders nothing until it knows whether setup is needed.
      const deadline = Date.now() + 20000;
      let markup = 0;
      while (Date.now() < deadline) {
        markup = await win.webContents
          .executeJavaScript('document.getElementById("root")?.innerHTML.length ?? 0')
          .catch(() => 0);
        // The gate and the detect() spinner both render early; wait for the
        // screen's own copy so the capture is not of a loading state.
        const settled = await win.webContents
          .executeJavaScript(
            `(() => {
              const t = document.body.innerText;
              if (t.includes('Looking for agents')) return false;
              // Either a text-heavy screen, or one with a laid-out timeline.
              const scrubber = document.querySelector('[data-castfy="scrubber"]');
              if (scrubber && scrubber.getBoundingClientRect().width > 50) return true;
              return t.length > 40;
            })()`
          )
          .catch(() => false);
        if (markup > 500 && settled) break;
        await new Promise((r) => setTimeout(r, 300));
      }
      // Optionally scrub to a position first, so a specific moment can be seen.
      const seekRatio = Number(argValue('--seek-ratio'));
      if (Number.isFinite(seekRatio)) {
        await win.webContents
          .executeJavaScript(
            `(() => {
              const el = document.querySelector('[data-castfy="scrubber"]');
              if (!el) return false;
              const r = el.getBoundingClientRect();
              const x = r.left + r.width * ${seekRatio};
              const y = r.top + r.height / 2;
              const o = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1 };
              el.dispatchEvent(new PointerEvent('pointerdown', o));
              el.dispatchEvent(new PointerEvent('pointerup', { ...o, buttons: 0 }));
              return true;
            })()`
          )
          .catch(() => false);
        await new Promise((r) => setTimeout(r, 2500));
      }

      // One more beat so fonts and images settle before the frame is grabbed.
      await new Promise((r) => setTimeout(r, 1200));

      const url = await win.webContents.executeJavaScript('location.href').catch(() => '?');
      const text = await win.webContents
        .executeJavaScript('document.body.innerText.slice(0, 300)')
        .catch(() => '');
      console.log(`--- on screen ---\n${text}\n-----------------`);
      // capturePage returns an empty frame for a window the compositor has
      // not drawn, so make sure it is actually on screen first.
      win.show();
      win.focus();
      await new Promise((r) => setTimeout(r, 800));

      const bounds = win.getContentBounds();
      const image = await win.webContents.capturePage({
        x: 0,
        y: 0,
        width: bounds.width,
        height: bounds.height,
      });
      const png = image.toPNG();
      console.log(`frame: ${image.getSize().width}x${image.getSize().height}, ${png.length} bytes`);
      await fs.writeFile(shot, png);
      console.log(`captured ${shot} — ${markup} bytes of markup at ${url}`);
      app.exit(0);
    });
  }
}

/**
 * Depth 2 catches both a new session folder and the steps.json inside it. The
 * debounce matters: ffmpeg and Playwright write in bursts, and an un-debounced
 * watcher would rescan dozens of times per second during a render.
 */
function watchLibrary() {
  const root = libraryRoot();
  let timer = null;
  const watcher = chokidar.watch(root, { depth: 2, ignoreInitial: true });

  // A folder appearing while a run is live is that run's output. This is the
  // only chance to make the link: the app never learns the session id any other
  // way, because the MCP generates it inside castfy0_start.
  watcher.on('addDir', (dir) => {
    if (path.dirname(dir) === root) runs.observe(path.basename(dir));
  });

  /**
   * The live view of a run. castfy0 appends to <session>/progress.jsonl as it
   * goes; each new line is forwarded to the window as it lands. Seeing the file
   * also attributes its folder to the live run, in case the folder appeared
   * before the watcher noticed it.
   */
  progressTail = new ProgressTail((sessionId, events) => {
    runs.observe(sessionId);
    win?.webContents.send('demo:progress', { sessionId, events });
  });
  const tail = progressTail;
  const onFile = (file) => {
    const isProgress =
      path.basename(file) === PROGRESS_FILE && path.dirname(path.dirname(file)) === root;
    if (isProgress) tail.read(file);
  };
  watcher.on('add', onFile);
  watcher.on('change', onFile);

  const ping = () => {
    clearTimeout(timer);
    timer = setTimeout(() => win?.webContents.send('library:changed'), 400);
  };
  watcher.on('all', ping);
  app.on('before-quit', () => watcher.close());
}

/**
 * The recording browser is a window of Castfy's own, driven by castfy0 over
 * the DevTools protocol (recording-window.js). Port 0: Chromium picks a free
 * port on 127.0.0.1 and writes it to userData/DevToolsActivePort.
 */
app.commandLine.appendSwitch('remote-debugging-port', '0');

/** The open recording window, while a run is going. */
let recording = null;

ipcMain.on('recording:input', (_e, event) => {
  const safe = sanitizeInput(event);
  if (safe) recording?.input(safe);
});

/**
 * `electron . --scan` prints the library as JSON and exits — the same code path
 * the window uses, so the data layer can be checked without eyeballing the UI.
 */
if (process.argv.includes('--scan')) {
  app.whenReady().then(async () => {
    await initStores();
    console.log(JSON.stringify(await scanLibrary(), null, 2));
    app.exit(0);
  });
}

/** Where Playwright keeps its browsers, and where Chromium is downloaded to. */
function browsersPath() {
  return process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(app.getPath('userData'), 'browsers');
}

/** Remotion entry — bundled at runtime, so it ships as source, not a build. */
function remotionEntry() {
  return path.join(dirname, 'remotion', 'index.ts');
}

async function runExport(sessionId, spec = {}, onProgress) {
  const { exportRecording } = await loadExport();
  return exportRecording({
    sessionId,
    libraryRoot: libraryRoot(),
    entryPoint: remotionEntry(),
    // Background images and overlays live in the app's bundle, not the library.
    publicRoot: app.isPackaged
      ? path.join(dirname, 'dist-renderer')
      : path.join(dirname, 'public'),
    browsersPath: browsersPath(),
    onProgress,
    ...spec,
  });
}

/**
 * `electron . --export <sessionId>` renders one recording and exits — the same
 * path the UI uses, so the pipeline can be verified without a window.
 */

/**
 * `electron . --probe-timeline <sessionId>` opens a project, drives the
 * timeline from outside React, and reports what actually happens — clicking to
 * seek, and whether the playhead tracks during playback.
 */
if (process.argv.includes('--probe-timeline')) {
  app.whenReady().then(async () => {
    const id = argValue('--probe-timeline');
    registerAppProtocol();
    await initStores();

    win = new BrowserWindow({
      width: 1180,
      height: 780,
      show: true,
      webPreferences: { preload: path.join(dirname, 'preload.cjs') },
    });
    win.webContents.on('console-message', (_e, level, message) => {
      if (level >= 2) console.error('[renderer]', message);
    });
    await win.loadURL(`castfy://app/index.html#/demo/${id}`);

    const evaluate = (script) => win.webContents.executeJavaScript(script).catch((e) => String(e));

    // Wait for the timeline to mount.
    const deadline = Date.now() + 25000;
    let found = false;
    while (Date.now() < deadline) {
      found = await evaluate('!!document.querySelector(\'[data-castfy="scrubber"]\')');
      if (found === true) break;
      await new Promise((r) => setTimeout(r, 400));
    }
    console.log('scrubber present:', found);
    if (found !== true) {
      console.log('on screen:', await evaluate('document.body.innerText.slice(0,200)'));
      app.exit(1);
      return;
    }

    console.log('player state:', JSON.stringify(await evaluate(`(() => {
      const video = document.querySelector('video');
      const text = document.body.innerText;
      return {
        videoEl: !!video,
        videoSrc: video ? String(video.currentSrc || video.src).slice(0, 90) : null,
        readyState: video ? video.readyState : null,
        emptyState: text.includes('Nothing recorded yet'),
        canvas: !!document.querySelector('canvas'),
      };
    })()`)));

    console.log('geometry:', JSON.stringify(await evaluate(`(() => {
      const s = document.querySelector('[data-castfy="scrubber"]').getBoundingClientRect();
      const p = document.querySelector('[data-castfy="playhead"]');
      return { scrubber: { x: Math.round(s.x), w: Math.round(s.width), h: Math.round(s.height) },
               playheadLeft: p ? p.style.left : null };
    })()`)));

    // Click at 60% of the scrubber and see whether the playhead follows.
    const STATE_SCRIPT = `document.querySelector('[data-castfy-state]')?.dataset.castfyState ?? 'absent'`;
    console.log('timeline state:', await evaluate(STATE_SCRIPT));

    console.log('footer text:', await evaluate('document.body.innerText.replace(/\s+/g, " ").slice(0, 260)'));

    console.log('click result:', JSON.stringify(await evaluate(`(() => {
      const el = document.querySelector('[data-castfy="scrubber"]');
      const r = el.getBoundingClientRect();
      const x = r.left + r.width * 0.6;
      const y = r.top + r.height / 2;
      const opts = { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, buttons: 1 };
      el.dispatchEvent(new PointerEvent('pointerdown', opts));
      el.dispatchEvent(new PointerEvent('pointerup', { ...opts, buttons: 0 }));
      return { dispatched: true };
    })()`)));

    await new Promise((r) => setTimeout(r, 1200));
    console.log('after click:', JSON.stringify(await evaluate(`(() => {
      const p = document.querySelector('[data-castfy="playhead"]');
      const g = document.querySelector('[data-castfy="progress"]');
      return { playheadLeft: p ? p.style.left : null, progressWidth: g ? g.style.width : null };
    })()`)));

    // Start playback and sample the playhead.
    await evaluate(`(() => {
      const btns = [...document.querySelectorAll('button')];
      const play = btns.find((b) => /play/i.test(b.getAttribute('aria-label') || '') || b.querySelector('svg'));
      if (play) play.click();
      return true;
    })()`);

    const samples = [];
    for (let i = 0; i < 6; i++) {
      await new Promise((r) => setTimeout(r, 700));
      samples.push(await evaluate(STATE_SCRIPT));
    }
    console.log('playhead while playing:', samples.join(' -> '));

    app.exit(0);
  });
}

if (process.argv.includes('--recut')) {
  app.whenReady().then(async () => {
    const id = argValue('--recut');
    const cutsFile = argValue('--cuts');
    try {
      const cuts = JSON.parse(await fs.readFile(cutsFile, 'utf8'));
      const { recutSession } = await loadRecut();
      const result = await recutSession({
        sessionDir: path.join(libraryRoot(), id),
        entryPoint: mcpEntry(),
        cuts,
        onProgress: (m) => console.log(m),
      });
      console.log(JSON.stringify(result, null, 2));
      app.exit(0);
    } catch (err) {
      console.error('recut failed:', err?.message ?? err);
      app.exit(1);
    }
  });
}

if (process.argv.includes('--export')) {
  app.whenReady().then(async () => {
    const id = process.argv[process.argv.indexOf('--export') + 1];
    try {
      // --spec <file> supplies the same render spec the studio sends, so
      // compositing can be checked without the UI.
      const specFile = argValue('--spec');
      const spec = specFile ? JSON.parse(await fs.readFile(specFile, 'utf8')) : {};
      const result = await runExport(id, spec, (m) =>
        process.stdout.write(`\r${m}                    `)
      );
      process.stdout.write('\n');
      console.log(JSON.stringify(result, null, 2));
      app.exit(0);
    } catch (err) {
      console.error('export failed:', err?.message ?? err);
      app.exit(1);
    }
  });
}

async function initStores() {
  runs = new RunStore(path.join(app.getPath('userData'), 'runs.json'));
  await runs.load();
  runs.reconcileOnStartup();

  projects = new ProjectStore(path.join(app.getPath('userData'), 'projects.json'));
  await projects.load();

  settings = new SettingsStore(path.join(app.getPath('userData'), 'settings.json'));
  await settings.load();

  // Recordings started straight from Claude Code never went through New Demo,
  // so give them a project or they would never show up in the library.
  const { sessions } = await scanLibrary();
  projects.adopt(sessions);
}

app.whenReady().then(async () => {
  if (
    process.argv.includes('--scan') ||
    process.argv.includes('--export') ||
    process.argv.includes('--recut') ||
    process.argv.includes('--probe-timeline')
  ) {
    return;
  }

  // Before anything looks for an agent CLI: a Dock-launched Mac app otherwise
  // cannot see ~/.local/bin or Homebrew.
  await adoptLoginShellPath();

  registerAppProtocol();
  await fs.mkdir(libraryRoot(), { recursive: true }).catch(() => {});
  await initStores();
  createWindow();
  watchLibrary();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('library:list', scanLibrary);
ipcMain.handle('library:get', (_e, id) => getSession(id));
ipcMain.handle('runs:list', () => runs.state.runs);

// --- projects ---------------------------------------------------------------

/** A project plus the recording it points at, if it has one yet. */
async function hydrate(project) {
  const session = project.sessionId ? await getSession(project.sessionId) : null;
  return { ...project, session };
}

ipcMain.handle('projects:list', async () => {
  const list = projects.list();
  return Promise.all(list.map(hydrate));
});
ipcMain.handle('projects:get', async (_e, id) => {
  const project = projects.get(id);
  return project ? hydrate(project) : null;
});
ipcMain.handle('projects:create', (_e, title) => projects.create({ title: String(title ?? '') }));
ipcMain.handle('projects:rename', (_e, id, title) => projects.rename(id, String(title ?? '')));
ipcMain.handle('projects:saveCuts', (_e, id, cuts) => projects.setCuts(id, cuts));
ipcMain.handle('projects:saveEditor', (_e, id, editor) => projects.setEditor(id, editor));
ipcMain.handle('projects:remove', (_e, id) => {
  projects.remove(id);
  return true;
});

/**
 * Backfills demo-source.mp4 for a recording made before the packager wrote one.
 * Returns the media URL when it is ready so the editor can switch to it, or
 * null to stay on the raw capture.
 */
ipcMain.handle('media:ensureSource', async (_e, sessionId) => {
  const root = libraryRoot();
  const dir = resolveWithin(root, sessionId);
  if (!dir) return null;

  const produced = await ensureSourceVideo({ sessionDir: dir, entryPoint: mcpEntry() });
  if (!produced) return null;

  return `castfy://app/${MEDIA_PREFIX}${encodeURIComponent(sessionId)}/${encodeURIComponent(
    path.basename(produced)
  )}`;
});

ipcMain.handle('export:recut', async (_e, sessionId, cuts) => {
  const root = libraryRoot();
  const dir = resolveWithin(root, sessionId);
  if (!dir) return { ok: false, error: 'Unknown recording.' };
  try {
    const { recutSession } = await loadRecut();
    const result = await recutSession({
      sessionDir: dir,
      entryPoint: mcpEntry(),
      cuts,
      onProgress: (message) => win?.webContents.send('export:progress', { sessionId, message }),
    });
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
});

ipcMain.handle('export:render', async (_e, sessionId, spec) => {
  try {
    const result = await runExport(sessionId, spec ?? {}, (message) =>
      win?.webContents.send('export:progress', { sessionId, message })
    );
    return { ok: true, ...result };
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) };
  }
});
ipcMain.handle('library:reveal', (_e, dir) => {
  const root = libraryRoot();
  const abs = path.resolve(dir);
  if (abs === root || abs.startsWith(root + path.sep)) shell.openPath(abs);
});

// --- connect -----------------------------------------------------------------

ipcMain.handle('clients:detect', async () => ({
  mcpEntry: mcpEntry(),
  mcpEntryExists: await fs
    .access(mcpEntry())
    .then(() => true)
    .catch(() => false),
  outputDir: libraryRoot(),
  clients: await detectClients(expectedRegistration()),
}));

ipcMain.handle('clients:disconnect', (_e, id) => disconnectClient(id));

/** Only https, and only to the outside browser — never a window we control. */
ipcMain.handle('shell:open', (_e, url) => {
  if (typeof url === 'string' && url.startsWith('https://')) shell.openExternal(url);
});

ipcMain.handle('agents:list', async () => ({
  agents: await detectAgents(),
  activeAgent: await pickAgent(settings.state.activeAgent),
}));

ipcMain.handle('settings:get', () => settings.state);
ipcMain.handle('settings:set', async (_e, patch) => {
  await settings.set(patch ?? {});
  return settings.state;
});

ipcMain.handle('agents:select', async (_e, id) => {
  await settings.set({ activeAgent: id });
  return settings.state.activeAgent;
});

ipcMain.handle('clients:connect', async (_e, id) =>
  connectClient(id, expectedRegistration())
);

// --- recorder setup ------------------------------------------------------------

/** Whether the recording browser is downloaded; the first-run gate asks this. */
ipcMain.handle('setup:browsers', () =>
  browserStatus({ mcpEntry: mcpEntry(), browsersPath: browsersPath() })
);

ipcMain.handle('setup:installBrowsers', () =>
  installBrowsers({
    mcpEntry: mcpEntry(),
    browsersPath: browsersPath(),
    onProgress: (progress) => win?.webContents.send('setup:progress', progress),
  })
);

// --- new demo ----------------------------------------------------------------

/**
 * The request handed to whichever agent the user drives. This is the prompt
 * surface for Mode B: the app does not run the loop, it only states the job
 * well enough that any MCP-capable client can do it.
 */
function composePrompt({ url, goal }) {
  return [
    'Record a product demo video using the castfy0 tools.',
    '',
    `Target URL: ${url}`,
    `Goal: ${goal}`,
    '',
    'Start with castfy0_start, drive the flow with the castfy0 action tools, and',
    'always finish with castfy0_end so the video gets packaged. Do not pass',
    'outputDir — the Castfy app sets it for you.',
  ].join('\n');
}

let running = null;

/** Follows castfy0's progress files; created by watchLibrary(). */
let progressTail = null;

/**
 * The recording a run produced, out of every folder it created.
 *
 * One run can create several: an agent that starts on a typo'd URL and then
 * calls castfy0_start again leaves an empty first folder behind. Taking the
 * first one linked the project to that empty folder — no steps, no video.
 * The newest finished recording is the one the agent meant; failing that, the
 * newest folder at all.
 */
async function pickRunRecording(sessionIds) {
  const root = libraryRoot();
  for (const id of [...sessionIds].reverse()) {
    if (await exists(path.join(root, id, 'steps.json'))) return id;
  }
  return sessionIds.at(-1) ?? null;
}

ipcMain.handle('demo:compose', (_e, input) => composePrompt(input));

/** Opens the agent's own login in a terminal; see agent-auth.js. */
ipcMain.handle('agent:login', async (_e, agentId) => {
  const id = agentId ?? (await pickAgent(settings.state.activeAgent));
  const command = id ? await buildCommand(id, {}) : null;
  if (!command) return { ok: false, error: 'That agent is not installed.' };
  return openLogin(id, command.binary);
});

/** Whether the agent is signed in: true, false, or null when it cannot tell. */
ipcMain.handle('agent:signedIn', async (_e, agentId) => {
  const id = agentId ?? (await pickAgent(settings.state.activeAgent));
  const command = id ? await buildCommand(id, {}) : null;
  if (!command) return null;
  return signedIn(id, command.binary, agentEnv(id, process.env));
});

ipcMain.handle('demo:copy', (_e, input) => {
  clipboard.writeText(composePrompt(input));
  return true;
});

ipcMain.handle('demo:run', async (_e, input) => {
  if (running) return { ok: false, error: 'A demo is already running.' };

  // Whichever agent the user chose in onboarding, falling back to any that is
  // installed so an uninstall does not permanently break the Run button.
  const agentId = await pickAgent(input.agentId ?? settings.state.activeAgent);
  if (!agentId) {
    return {
      ok: false,
      error: 'No agent CLI found. Install Claude Code, Codex or the Cursor CLI.',
    };
  }

  // Without the browser the agent would start, connect, and fail on its first
  // castfy0_start — a minute in. Saying so up front is kinder.
  const browsers = await browserStatus({ mcpEntry: mcpEntry(), browsersPath: browsersPath() });
  if (!browsers.ready) {
    return { ok: false, error: 'The recording browser is not installed yet. Finish setup first.' };
  }

  const prompt = composePrompt(input);
  const command = await buildCommand(agentId, {
    allowUnsandboxed: Boolean(settings.state.allowUnsandboxed),
  });
  if (!command) return { ok: false, error: `${agentId} is no longer installed.` };

  const env = agentEnv(agentId, {
    ...process.env,
    CASTFY0_OUTPUT_DIR: libraryRoot(),
    PLAYWRIGHT_BROWSERS_PATH: browsersPath(),
    // The composer's switch: in the background (a hidden window, shown live
    // in the studio) unless the user wants to watch the browser itself.
    CASTFY0_BROWSER_WINDOW: input.headless === false ? 'visible' : 'hidden',
  });
  delete env.CASTFY0_HOST_CDP;
  delete env.CASTFY0_HOST_PAGE;

  // A signed-out agent fails a minute in with an exit code; asking first means
  // the user gets a Sign in button instead.
  if ((await signedIn(agentId, command.binary, env)) === false) {
    return {
      ok: false,
      error: `${command.label} is not signed in.`,
      needsLogin: agentId,
    };
  }

  const send = (channel, payload) => win?.webContents.send(channel, payload);

  // The browser castfy0 records in: Castfy's own window, shown in the studio.
  // Without the DevTools endpoint castfy0 launches its own browser as before.
  const endpoint = await devtoolsEndpoint(app.getPath('userData'));
  recording?.close();
  recording = endpoint
    ? await openRecordingWindow({
        runId: Date.now().toString(36),
        viewport: { width: 1280, height: 720 },
        visible: input.headless === false,
        onFrame: (frame) => send('recording:frame', frame),
      })
    : null;
  if (recording) {
    env.CASTFY0_HOST_CDP = endpoint;
    env.CASTFY0_HOST_PAGE = recording.marker;
  }

  running = spawn(command.binary, command.args, {
    // .cmd shims cannot be executed without a shell on Windows.
    shell: command.binary.endsWith('.cmd') || command.binary.endsWith('.bat'),
    // Its own process group outside Windows, so Cancel can stop the browser too.
    ...spawnOptionsForRun(),
    // stdin is a pipe because the prompt goes through it. Passing it as an
    // argument meant cmd.exe re-split a multi-line prompt into separate
    // arguments, and Codex rejected the run before it began.
    stdio: ['pipe', 'pipe', 'pipe'],
    env,
  });

  // Written and closed immediately: agents wait on stdin and will not start
  // until it ends.
  running.stdin.write(prompt);
  running.stdin.end();

  // Opened here and closed on exit, so a folder that appears in between can be
  // attributed to this run and a crash leaves a record instead of a folder that
  // reads as "recording" forever.
  const run = runs.start({ url: input.url, goal: input.goal, projectId: input.projectId ?? null });

  /**
   * Re-reads the run's progress files every second, alongside the watcher.
   * File-change notifications are not guaranteed on every platform and file
   * system, and the live panel must not depend on them; reading an unchanged
   * file costs one stat. Stopped in settle().
   */
  const progressPoll = setInterval(() => {
    const root = libraryRoot();
    for (const id of runs.active?.sessionIds ?? []) {
      progressTail?.read(path.join(root, id, PROGRESS_FILE));
    }
  }, 1000);

  let stderr = '';
  let stdout = '';
  const settle = async (code, error) => {
    running = null;
    recording?.close();
    recording = null;
    send('recording:frame', null);
    clearInterval(progressPoll);
    // One last read, so lines written just before the agent exited still land.
    await Promise.all(
      (runs.active?.sessionIds ?? []).map((id) =>
        progressTail?.read(path.join(libraryRoot(), id, PROGRESS_FILE))
      )
    );

    // Agents explain themselves on stdout as often as stderr.
    const explained =
      code === 0 && !error ? null : explainAgentFailure({ code, stdout, stderr });
    const message = error ?? explained?.message ?? null;

    const finished = runs.finish({ code, error: message });

    // Linking here is what turns a project the user typed a title for into a
    // playable demo. See pickRunRecording for which folder that is.
    const sessionId = await pickRunRecording(finished?.sessionIds ?? []);
    if (run.projectId && sessionId) projects.linkSession(run.projectId, sessionId);

    send('demo:done', {
      code,
      error: message,
      hint: explained?.hint ?? null,
      needsLogin: explained?.needsLogin ? agentId : null,
      runId: run.id,
      projectId: run.projectId,
      sessionId,
    });
  };

  send('demo:log', `$ ${command.label} — starting recording…\n\n`);
  running.stdout.on('data', (d) => {
    stdout += d.toString();
    send('demo:log', d.toString());
  });
  running.stderr.on('data', (d) => {
    stderr += d.toString();
    send('demo:log', d.toString());
  });
  running.on('close', (code) => settle(code));
  running.on('error', (err) => settle(-1, err.message));

  return { ok: true, agentId, runId: run.id };
});

ipcMain.handle('demo:cancel', () => {
  if (!running) return false;
  // The whole tree: claude spawns the MCP, which spawns Chromium and ffmpeg.
  // Signalling the parent alone orphans the browser.
  killRunTree(running, spawn);
  return true;
});

// A run is its own process group, so quitting would otherwise leave it going.
app.on('before-quit', () => {
  recording?.close();
  if (running) killRunTree(running, spawn);
});
