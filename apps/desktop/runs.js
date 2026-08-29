import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Local record of runs this app launched.
 *
 * Deliberately not a job queue. steps.json already records every *finished*
 * recording, so the only thing the filesystem cannot express is a run that died
 * before castfy0_end — that folder just sits there with no manifest, and a
 * library reading disk alone shows it as "recording" forever.
 *
 * A JSON file rather than SQLite: tens of rows, no queries, one writer.
 */

/**
 * A session folder with no manifest and no writes for this long is not still
 * recording — the process behind it is gone. Generous, because encoding a long
 * demo can leave the directory untouched for a while.
 */
export const STALE_AFTER_MS = 10 * 60 * 1000;

function emptyState() {
  return { version: 1, runs: [] };
}

export class RunStore {
  constructor(file) {
    this.file = file;
    this.state = emptyState();
    this.queue = Promise.resolve();
  }

  async load() {
    try {
      const raw = await fs.readFile(this.file, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.runs)) this.state = parsed;
    } catch {
      // Missing or corrupt: a lost run history is not worth failing to start
      // over, and the filesystem still holds every finished recording.
      this.state = emptyState();
    }
    return this.state;
  }

  /** Serialised so two quick lifecycle events cannot interleave writes. */
  save() {
    this.queue = this.queue.then(async () => {
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, `${JSON.stringify(this.state, null, 2)}\n`, 'utf8');
    });
    return this.queue;
  }

  get active() {
    return this.state.runs.find((r) => r.status === 'running') ?? null;
  }

  start({ url, goal, projectId = null }) {
    const run = {
      id: randomUUID().slice(0, 8),
      url,
      goal,
      /** The project this run was started from, if any. */
      projectId,
      status: 'running',
      startedAt: Date.now(),
      finishedAt: null,
      exitCode: null,
      error: null,
      // Filled by observe() as the MCP creates session folders. The app cannot
      // know the id up front — the MCP generates it inside castfy0_start.
      sessionIds: [],
    };
    this.state.runs.unshift(run);
    this.state.runs = this.state.runs.slice(0, 100);
    this.save();
    return run;
  }

  /** Attribute a session folder to the run that was live when it appeared. */
  observe(sessionId) {
    const run = this.active;
    if (!run || run.sessionIds.includes(sessionId)) return;
    run.sessionIds.push(sessionId);
    this.save();
  }

  finish({ code, error }) {
    const run = this.active;
    if (!run) return null;
    run.status = code === 0 && !error ? 'finished' : 'failed';
    run.finishedAt = Date.now();
    run.exitCode = code ?? null;
    run.error = error ?? null;
    this.save();
    return run;
  }

  /** Nothing can still be running across a restart — the child process is gone. */
  reconcileOnStartup() {
    let changed = false;
    for (const run of this.state.runs) {
      if (run.status === 'running') {
        run.status = 'failed';
        run.error = 'Castfy quit while this run was in progress.';
        run.finishedAt = run.finishedAt ?? Date.now();
        changed = true;
      }
    }
    if (changed) this.save();
  }

  /** sessionId -> the run that produced it, for annotating library rows. */
  bySession() {
    const map = new Map();
    for (const run of this.state.runs) {
      for (const id of run.sessionIds) map.set(id, run);
    }
    return map;
  }
}

/**
 * Decides what an unfinished session folder actually is. A folder with no
 * manifest is ambiguous on its own: it might be recording right now, it might
 * be the wreckage of a crash, and only the run record or the clock can say.
 */
export function resolveUnfinished(session, run, now = Date.now()) {
  if (run && run.status === 'failed') {
    return { status: 'failed', error: run.error ?? 'The run did not finish.' };
  }
  if (run && run.status === 'running') {
    return { status: 'recording' };
  }
  if (now - session.mtime > STALE_AFTER_MS) {
    return {
      status: 'abandoned',
      error: 'No manifest was written and the folder has gone quiet.',
    };
  }
  return { status: 'recording' };
}
