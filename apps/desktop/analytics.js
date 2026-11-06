import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/**
 * Product analytics: which steps people reach, so we can see where Castfy gets
 * stuck. Events go to the same PostHog project as the website, so one funnel
 * covers visit → download → first launch → sign-in → first demo → export.
 *
 * What is sent: the event, the app version, the OS and architecture, and a
 * few numbers or names chosen per event (which agent, how long a run took,
 * why it failed as a category). Never what is on screen, the URLs or prompts
 * typed, recordings, file names or error text.
 *
 * Who: an anonymous id per install (analytics.json in the app's data folder).
 * Signing in links it to the Castfy account (its id, email and name), so a
 * stuck beta tester can be found; signing out goes back to the install id.
 *
 * Off when the user turns "Share usage data" off in Settings, in development,
 * and when the build carries no PostHog key (castfy.config.json).
 */

/** Events wait here and go out together, every so often and at quit. */
const FLUSH_EVERY_MS = 30 * 1000;
const FLUSH_TIMEOUT_MS = 4000;
const MAX_QUEUE = 500;

const OS_NAMES = { darwin: "Mac OS X", win32: "Windows", linux: "Linux" };

export class Analytics {
  /**
   * @param {{
   *   app: import('electron').App,
   *   file: string,
   *   key: string | undefined,
   *   host: string | undefined,
   *   enabled: () => boolean,
   * }} options enabled is the user's choice, read at each event.
   */
  constructor({ app, file, key, host, enabled }) {
    this.app = app;
    this.file = file;
    this.key = key?.trim() || null;
    this.host = (host?.trim() || "https://us.i.posthog.com").replace(/\/$/, "");
    this.userEnabled = enabled;
    this.state = { installId: null, lastVersion: null };
    /** The account's id once signed in; events are theirs from then on. */
    this.userId = null;
    this.queue = [];
    this.timer = null;
  }

  /** Reads or makes the install id; says whether this is the first launch. */
  async load() {
    let saved = null;
    try {
      saved = JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      // First launch, or an unreadable file: a new id.
    }
    const firstLaunch = !saved?.installId;
    const previousVersion = saved?.lastVersion ?? null;
    this.state = {
      installId: saved?.installId || randomUUID(),
      lastVersion: this.app.getVersion(),
    };
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs
      .writeFile(this.file, `${JSON.stringify(this.state, null, 2)}\n`, "utf8")
      .catch(() => {});

    this.timer = setInterval(() => this.flush(), FLUSH_EVERY_MS);
    this.timer.unref?.();
    return { firstLaunch, previousVersion };
  }

  get active() {
    return Boolean(
      this.key &&
        this.state.installId &&
        (this.app.isPackaged || process.env.CASTFY_ANALYTICS_DEV === "1") &&
        this.userEnabled()
    );
  }

  get distinctId() {
    return this.userId ?? this.state.installId;
  }

  /** Every event carries these. */
  base() {
    return {
      app_version: this.app.getVersion(),
      $os: OS_NAMES[process.platform] ?? process.platform,
      $os_version: os.release(),
      arch: process.arch,
      $lib: "castfy-desktop",
      install_id: this.state.installId,
    };
  }

  /** @param {string} event @param {Record<string, unknown>} [properties] */
  capture(event, properties = {}) {
    if (!this.active) {
      return;
    }
    this.queue.push({
      event,
      distinct_id: this.distinctId,
      timestamp: new Date().toISOString(),
      properties: { ...this.base(), ...properties },
    });
    if (this.queue.length > MAX_QUEUE) {
      this.queue.splice(0, this.queue.length - MAX_QUEUE);
    }
    this.soon();
  }

  /** Sends a moment after the last event, so quitting rarely loses any. */
  soon() {
    clearTimeout(this.pending);
    this.pending = setTimeout(() => this.flush(), 1500);
    this.pending.unref?.();
  }

  /**
   * Signed in: from now on events belong to the account, and the install's
   * earlier events are merged into it.
   * @param {{ id: string, email?: string, name?: string } | null} user
   */
  identify(user) {
    if (!user?.id || user.id === this.userId) {
      return;
    }
    this.userId = user.id;
    if (!this.active) {
      return;
    }
    this.queue.push({
      event: "$identify",
      distinct_id: user.id,
      timestamp: new Date().toISOString(),
      properties: {
        ...this.base(),
        $anon_distinct_id: this.state.installId,
        $set: { email: user.email ?? null, name: user.name ?? null },
      },
    });
    this.soon();
  }

  /** Signed out: back to the install's own id. */
  reset() {
    this.userId = null;
  }

  async flush() {
    if (this.queue.length === 0 || !this.key) {
      return;
    }
    const batch = this.queue.splice(0, this.queue.length);
    try {
      const response = await fetch(`${this.host}/batch/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: this.key, batch }),
        signal: AbortSignal.timeout(FLUSH_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new Error(`PostHog answered ${response.status}`);
      }
    } catch {
      // Offline: put them back for the next try, oldest first.
      this.queue.unshift(...batch);
      if (this.queue.length > MAX_QUEUE) {
        this.queue.splice(0, this.queue.length - MAX_QUEUE);
      }
    }
  }
}
