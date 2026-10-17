import { BrowserWindow, WebContentsView } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * The browser a recording runs in, inside Castfy.
 *
 * castfy0 used to launch its own Chrome. Placed off-screen it was still shown
 * on macOS (the system moves windows back on screen), and headless Chrome
 * captures at CSS size, losing the 2x picture. A Castfy window that is never
 * shown did not work either: on macOS a DevTools client connecting to it got
 * no answer, so castfy0 fell back to its own Chrome.
 *
 * So the browser is a view inside Castfy's own window, underneath the studio.
 * To macOS and Chromium it is an ordinary page on screen: it paints at the
 * display's pixel ratio and answers like any other. The user never sees it
 * directly; the studio covers it and shows it live (castfy0's live frame),
 * passing clicks and keys through, so signing in to a site happens right there. castfy0 drives it
 * over the DevTools protocol (see main.js, HOST_FILE). Logins stay in the
 * browser's own profile between recordings.
 */

/** Castfy's browser profile: kept on disk, apart from the app's own session. */
const PARTITION = 'persist:castfy-browser';

const WEB_PREFERENCES = {
  partition: PARTITION,
  // The page must run at full speed while it is filmed, also when Castfy is
  // behind another app.
  backgroundThrottling: false,
};

/** The DevTools endpoint, once the app is ready; null without one. */
export async function devtoolsEndpoint(userData) {
  // Port 0 picks a free port; Chromium writes the one it chose here.
  try {
    const [port] = (await fs.readFile(path.join(userData, 'DevToolsActivePort'), 'utf8')).split('\n');
    return /^\d+$/.test(port) ? `http://127.0.0.1:${port}` : null;
  } catch {
    return null;
  }
}

/** The first page: a marker castfy0 finds the browser by. */
function markerPage(marker) {
  const html =
    '<body style="margin:0;background:#0b0b0d;color:#888;font:14px system-ui;display:grid;place-items:center;height:100vh">' +
    '<div>Opening the page…<div style="height:2px;background:#5e6ad2;animation:p 1s infinite alternate"></div></div>' +
    '<style>@keyframes p{from{width:0}to{width:100%}}</style></body>';
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}#${marker}`;
}

/**
 * Opens the recording browser for a run.
 *
 * In `host`, Castfy's main window, as a view under the studio; or, when the
 * user wants to watch it (`visible`), as a window of its own.
 *
 * Castfy does not take frames from it: on macOS a frame subscription on the
 * page stopped DevTools clients from connecting, so castfy0 could not drive
 * it. castfy0 films the page anyway and keeps its live frame (live.jpg) for
 * the studio, which shows that.
 */
export async function openRecordingWindow({ host, runId, viewport, visible }) {
  const marker = `castfy-recording-${runId}`;
  let window = null;
  let view = null;
  if (visible || !host || host.isDestroyed()) {
    window = new BrowserWindow({
      width: viewport.width,
      height: viewport.height,
      useContentSize: true,
      resizable: false,
      title: 'Castfy recording',
      webPreferences: WEB_PREFERENCES,
    });
  } else {
    view = new WebContentsView({ webPreferences: WEB_PREFERENCES });
    view.setBounds({ x: 0, y: 0, width: viewport.width, height: viewport.height });
    // Index 0: under the studio's own view, which covers it.
    host.contentView.addChildView(view, 0);
  }
  const contents = (window ?? view).webContents;
  await contents.loadURL(markerPage(marker)).catch(() => {});

  // A link that opens a new window loads here instead: another window would
  // be one the studio does not show, and macOS does not draw it.
  contents.setWindowOpenHandler(({ url }) => {
    if (visible) {
      return { action: 'allow', overrideBrowserWindowOptions: { webPreferences: WEB_PREFERENCES } };
    }
    contents.loadURL(url).catch(() => {});
    return { action: 'deny' };
  });

  let closed = false;
  return {
    marker,
    /** The page castfy0 records in. */
    contents,
    /** Passes the studio's mouse and keyboard to the page. */
    input(event) {
      if (!closed) contents.sendInputEvent(event);
    },
    close() {
      if (closed) return;
      closed = true;
      if (window && !window.isDestroyed()) window.destroy();
      if (view) {
        if (!host.isDestroyed()) host.contentView.removeChildView(view);
        if (!contents.isDestroyed()) contents.close();
      }
    },
  };
}

/** The input events the studio may pass on, and nothing else. */
const INPUT_TYPES = new Set(['mouseDown', 'mouseUp', 'mouseMove', 'mouseWheel', 'keyDown', 'keyUp', 'char']);
const BUTTONS = new Set(['left', 'middle', 'right']);
const MODIFIERS = new Set(['shift', 'control', 'ctrl', 'alt', 'meta', 'cmd', 'command']);

/** Checks an input event from the renderer before it reaches the page. */
export function sanitizeInput(event) {
  if (!event || !INPUT_TYPES.has(event.type)) return null;
  const out = { type: event.type };
  if (Array.isArray(event.modifiers)) out.modifiers = event.modifiers.filter((m) => MODIFIERS.has(m));
  if (event.type.startsWith('mouse')) {
    if (!Number.isFinite(event.x) || !Number.isFinite(event.y)) return null;
    out.x = Math.round(event.x);
    out.y = Math.round(event.y);
    if (BUTTONS.has(event.button)) out.button = event.button;
    if (Number.isInteger(event.clickCount)) out.clickCount = event.clickCount;
    if (event.type === 'mouseWheel') {
      out.deltaX = Number(event.deltaX) || 0;
      out.deltaY = Number(event.deltaY) || 0;
    }
    return out;
  }
  if (typeof event.keyCode !== 'string' || event.keyCode.length === 0 || event.keyCode.length > 20) return null;
  out.keyCode = event.keyCode;
  return out;
}
