import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Follows the progress.jsonl files castfy0 writes into each recording.
 *
 * castfy0 appends one JSON object per line as a run goes — the session
 * starting, every action, each packaging stage, and done or error. This reads
 * only what was appended since the last read, so a long run never re-sends its
 * history, and holds back a trailing partial line until its newline arrives.
 *
 * It is the only live view of a run: a headless agent (`claude -p`) prints
 * nothing until it exits, and steps.json is not written until the end.
 */

export const PROGRESS_FILE = 'progress.jsonl';

export class ProgressTail {
  /** @param {(sessionId: string, events: object[]) => void} onEvents */
  constructor(onEvents) {
    this.onEvents = onEvents;
    /** file -> { offset, partial } */
    this.files = new Map();
    /** file -> the read in flight, so reads of one file never overlap */
    this.reading = new Map();
  }

  /** Reads whatever has been appended to `file` since the last call. */
  read(file) {
    const previous = this.reading.get(file) ?? Promise.resolve();
    const next = previous.then(() => this.#readNew(file)).catch(() => {
      // A file removed mid-read, or a transient lock; the next change retries.
    });
    this.reading.set(file, next);
    return next;
  }

  async #readNew(file) {
    const state = this.files.get(file) ?? { offset: 0, partial: '' };
    const { size } = await fs.stat(file);

    // Shorter than before means the file was replaced; start over.
    if (size < state.offset) {
      state.offset = 0;
      state.partial = '';
    }
    if (size === state.offset) return;

    const handle = await fs.open(file, 'r');
    let chunk;
    try {
      const length = size - state.offset;
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, state.offset);
      chunk = buffer.toString('utf8');
    } finally {
      await handle.close();
    }
    state.offset = size;

    const lines = (state.partial + chunk).split('\n');
    state.partial = lines.pop() ?? '';
    this.files.set(file, state);

    const events = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        events.push(JSON.parse(line));
      } catch {
        // A malformed line is skipped rather than ending the stream.
      }
    }
    if (events.length) this.onEvents(path.basename(path.dirname(file)), events);
  }
}
