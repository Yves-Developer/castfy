import { BrowserWindow } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * The browser a recording runs in, inside Castfy.
 *
 * castfy0 used to launch its own Chrome. Placed off-screen it was still shown
 * on macOS (the system moves windows back on screen), and headless Chrome
 * captures at CSS size, losing the 2x picture. So Castfy keeps the browser:
 * a window of its own that is never shown, at the recording's viewport size
 * and the display's pixel ratio, which castfy0 drives over the DevTools
 * protocol (CASTFY0_HOST_CDP / CASTFY0_HOST_PAGE). The studio shows its frames
 * live and passes the user's clicks and keys through, so signing in to a site
 * happens right there. Logins stay in the browser's own profile between
 * recordings.
 */

/** Castfy's browser profile: kept on disk, apart from the app's own session. */
const PARTITION = 'persist:castfy-browser';
/** The live view does not need every frame, or full size. */
const LIVE_FPS = 10;
const LIVE_WIDTH = 1280;
/** How long a hidden window may take to paint before offscreen is used. */
const PAINT_PROBE_MS = 2500;

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

/** The first page: a marker castfy0 finds the window by, that also animates so painting can be checked. */
function markerPage(marker) {
  const html =
    '<body style="margin:0;background:#0b0b0d;color:#888;font:14px system-ui;display:grid;place-items:center;height:100vh">' +
    '<div>Opening the page…<div style="height:2px;background:#5e6ad2;animation:p 1s infinite alternate"></div></div>' +
    '<style>@keyframes p{from{width:0}to{width:100%}}</style></body>';
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}#${marker}`;
}

function createWindow({ viewport, visible, offscreen }) {
  return new BrowserWindow({
    width: viewport.width,
    height: viewport.height,
    useContentSize: true,
    show: visible,
    resizable: false,
    title: 'Castfy recording',
    webPreferences: {
      partition: PARTITION,
      // A hidden window is a background window to Chromium; the page must run
      // at full speed while it is filmed.
      backgroundThrottling: false,
      offscreen,
    },
  });
}

/** Resolves true if the window delivers a frame within PAINT_PROBE_MS. */
function paints(win, offscreen) {
  return new Promise((resolve) => {
    const done = (value) => {
      clearTimeout(timer);
      if (offscreen) win.webContents.off('paint', onPaint);
      else win.webContents.endFrameSubscription();
      resolve(value);
    };
    const onPaint = () => done(true);
    const timer = setTimeout(() => done(false), PAINT_PROBE_MS);
    if (offscreen) win.webContents.on('paint', onPaint);
    else win.webContents.beginFrameSubscription(false, () => done(true));
  });
}

/**
 * Opens the recording window for a run.
 *
 * `onFrame` receives JPEG frames for the live view. Returns null if no window
 * could be made to paint; the run then falls back to castfy0's own browser.
 */
export async function openRecordingWindow({ runId, viewport, visible, onFrame }) {
  const marker = `castfy-recording-${runId}`;
  let win = null;
  let offscreen = false;
  // A hidden window paints on the systems tried, but not every compositor has
  // to: then an offscreen one, which renders without any native window.
  for (const mode of visible ? [false] : [false, true]) {
    win = createWindow({ viewport, visible, offscreen: mode });
    if (mode) win.webContents.setFrameRate(60);
    const painted = paints(win, mode);
    await win.loadURL(markerPage(marker)).catch(() => {});
    if (await painted) {
      offscreen = mode;
      break;
    }
    win.destroy();
    win = null;
  }
  if (!win) return null;

  // Pages the site opens (target=_blank, popups) stay hidden too, and castfy0
  // sees them as tabs.
  win.webContents.setWindowOpenHandler(() => ({
    action: 'allow',
    overrideBrowserWindowOptions: {
      show: visible,
      webPreferences: { partition: PARTITION, backgroundThrottling: false },
    },
  }));

  let lastSent = 0;
  const onImage = (image) => {
    const now = Date.now();
    if (now - lastSent < 1000 / LIVE_FPS || image.isEmpty()) return;
    lastSent = now;
    const size = image.getSize();
    const scaled = size.width > LIVE_WIDTH ? image.resize({ width: LIVE_WIDTH, quality: 'good' }) : image;
    onFrame?.({ runId, jpeg: scaled.toJPEG(75), viewport });
  };
  if (offscreen) win.webContents.on('paint', (_e, _dirty, image) => onImage(image));
  else win.webContents.beginFrameSubscription(false, onImage);

  return {
    marker,
    window: win,
    /** Passes the studio's mouse and keyboard to the page. */
    input(event) {
      if (win.isDestroyed()) return;
      win.webContents.sendInputEvent(event);
    },
    close() {
      if (win.isDestroyed()) return;
      if (!offscreen) win.webContents.endFrameSubscription();
      win.destroy();
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
