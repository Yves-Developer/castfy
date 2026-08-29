import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Small persisted preferences. Currently just which agent drives recordings,
 * chosen in onboarding and reused by the Run button.
 */
export class SettingsStore {
  constructor(file) {
    this.file = file;
    this.state = { version: 1, activeAgent: null };
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
