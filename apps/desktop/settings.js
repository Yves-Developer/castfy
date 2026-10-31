import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Small persisted preferences. Currently just which agent drives recordings,
 * chosen in onboarding and reused by the Run button.
 */
export class SettingsStore {
  constructor(file) {
    this.file = file;
    this.state = {
      version: 1,
      activeAgent: null,
      /**
       * Lets Codex run tools unattended by bypassing its sandbox. Off by
       * default: it applies to the whole run, not only castfy0's tools.
       */
      allowUnsandboxed: false,
      /**
       * The plan step of onboarding was answered (trial or checkout). Shown
       * once; the plan itself lives on the backend, not here.
       */
      planChosen: false,
    };
  }

  async load() {
    try {
      const parsed = JSON.parse(await fs.readFile(this.file, 'utf8'));
      if (parsed && typeof parsed === 'object') this.state = { ...this.state, ...parsed };
    } catch {
      // Missing or corrupt: defaults are fine, and the agent falls back to
      // whichever CLI is installed.
    }
    return this.state;
  }

  async set(patch) {
    this.state = { ...this.state, ...patch };
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
    return this.state;
  }
}
