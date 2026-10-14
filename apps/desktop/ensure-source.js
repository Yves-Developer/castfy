import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Makes sure a recording has its seek-friendly editing source on disk.
 *
 * The packager writes demo-source.mp4 at the end of a run, but every recording
 * made before it existed has only the raw WebM. Playwright's capture is
 * sparsely keyframed, which is fine to play straight through and slow to jump
 * around in — so an editor that renders from keep ranges wants the transcode.
 *
 * Done here rather than in the directory scan: it costs seconds, and the
 * recordings list must stay instant.
 */

/** In flight per session, so two callers cannot start the same transcode twice. */
const pending = new Map();

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function transcode(sessionDir, entryPoint) {
  const root = path.dirname(entryPoint);
  const { generateSourceVideo } = await import(
    pathToFileURL(path.join(root, 'generator/video-source.js')).href
  );

  const raw = path.join(sessionDir, 'demo.webm');
  if (!(await exists(raw))) return null;

  return await generateSourceVideo(raw, path.join(sessionDir, 'demo-source.mp4'));
}

/**
 * @returns the path to demo-source.mp4, or null when there is no raw footage to
 *          transcode or the transcode failed. Callers fall back to the raw file.
 */
export async function ensureSourceVideo({ sessionDir, entryPoint }) {
  const out = path.join(sessionDir, 'demo-source.mp4');
  if (await exists(out)) return out;

  const inFlight = pending.get(sessionDir);
  if (inFlight) return inFlight;

  const job = transcode(sessionDir, entryPoint)
    .catch(() => null)
    .finally(() => pending.delete(sessionDir));

  pending.set(sessionDir, job);
  return job;
}
