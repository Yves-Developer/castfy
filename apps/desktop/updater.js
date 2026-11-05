import electronUpdater from 'electron-updater';

/**
 * electron-updater makes its updater the first time it is asked for one, and
 * that needs a running Electron app; so it is asked only once the app starts.
 */
let autoUpdater = null;

/**
 * Keeps the app up to date, the quiet way.
 *
 * At launch, and every few hours after, the app asks castfy.app/updates for
 * the newest published release (electron-builder.yml, `publish`). A newer
 * one downloads in the background; once it is ready the renderer shows a
 * small "ready, restart to update" notice. Restarting installs it; otherwise
 * it installs the next time the app quits. Nothing restarts on its own, and
 * a restart is refused while a recording or an export is running.
 *
 * Only in a packaged app: in development there is no update to look for.
 * A release still in draft on GitHub is not offered: the site only serves
 * the published one.
 */

/** How often to look again while the app stays open. */
const CHECK_EVERY_MS = 4 * 60 * 60 * 1000;
/** The first look waits a little, so it never competes with start-up. */
const FIRST_CHECK_AFTER_MS = 20 * 1000;

/**
 * @typedef {{
 *   status: 'idle' | 'checking' | 'downloading' | 'ready' | 'error',
 *   version: string | null,
 *   percent: number,
 *   error: string | null,
 * }} UpdateState
 */

export class Updater {
  /**
   * @param {{
   *   app: import('electron').App,
   *   ipcMain: import('electron').IpcMain,
   *   send: (channel: string, payload: unknown) => void,
   *   isBusy: () => string | null,
   * }} options isBusy says what would be lost by restarting now, or null.
   */
  constructor({ app, ipcMain, send, isBusy }) {
    this.app = app;
    this.send = send;
    this.isBusy = isBusy;
    /** @type {UpdateState} */
    this.state = { status: 'idle', version: null, percent: 0, error: null };

    ipcMain.handle('update:state', () => this.state);
    ipcMain.handle('update:check', () => this.check());
    ipcMain.handle('update:install', () => this.install());
  }

  start() {
    if (!this.app.isPackaged) return;
    autoUpdater = electronUpdater.autoUpdater;

    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    // Castfy's versions are betas (0.1.0-beta.24); a beta takes the next beta.
    autoUpdater.allowPrerelease = true;
    autoUpdater.logger = {
      info: (m) => console.log('[update]', m),
      warn: (m) => console.warn('[update]', m),
      error: (m) => console.error('[update]', m),
      debug: () => {},
    };

    autoUpdater.on('checking-for-update', () => {
      // A download in progress or a ready update is not set back by a check.
      if (this.state.status === 'idle' || this.state.status === 'error') {
        this.set({ status: 'checking', error: null });
      }
    });
    autoUpdater.on('update-not-available', () => {
      if (this.state.status === 'checking') this.set({ status: 'idle' });
    });
    autoUpdater.on('update-available', (info) => {
      this.set({ status: 'downloading', version: info.version, percent: 0 });
    });
    autoUpdater.on('download-progress', (progress) => {
      this.set({ status: 'downloading', percent: Math.round(progress.percent ?? 0) });
    });
    autoUpdater.on('update-downloaded', (info) => {
      this.set({ status: 'ready', version: info.version, percent: 100 });
    });
    autoUpdater.on('error', (error) => {
      // Offline, or the site briefly unreachable: not worth a notice. A
      // ready update stays ready; the next check tries again.
      console.error('[update] failed:', error?.message ?? error);
      if (this.state.status !== 'ready') {
        this.set({ status: 'error', error: error?.message ?? String(error) });
      }
    });

    setTimeout(() => this.check(), FIRST_CHECK_AFTER_MS);
    setInterval(() => this.check(), CHECK_EVERY_MS).unref?.();
  }

  /** Looks for an update now; a ready or downloading one is left alone. */
  async check() {
    if (!autoUpdater) return this.state;
    if (this.state.status === 'ready' || this.state.status === 'downloading') {
      return this.state;
    }
    try {
      await autoUpdater.checkForUpdates();
    } catch {
      // Reported through the 'error' event.
    }
    return this.state;
  }

  /** Restarts into the downloaded update, unless that would cut work short. */
  install() {
    if (this.state.status !== 'ready') {
      return { ok: false, reason: 'not-ready' };
    }
    const busy = this.isBusy();
    if (busy) return { ok: false, reason: busy };
    // After this handler has answered, so the renderer is not left waiting.
    setImmediate(() => autoUpdater.quitAndInstall(false, true));
    return { ok: true };
  }

  /** @param {Partial<UpdateState>} patch */
  set(patch) {
    this.state = { ...this.state, ...patch };
    this.send('update:state', this.state);
  }
}
