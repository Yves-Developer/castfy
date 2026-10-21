import fs from 'node:fs/promises';
import path from 'node:path';

/** The zooms the user removed on the timeline, kept with the recording. */
const ZOOM_EDITS_FILE = 'zoom-edits.json';

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Where auto-zoom should move to, from the segment recorder's clicks and
 * hovers (segments.json). Null for recordings that have none.
 *
 * Each event is tagged for remotion/zoom.ts with:
 * - its step's action (steps.json): typing into a field is recorded as a click
 *   on it, and zooms closer than a click;
 * - the clip it is in, which a zoom does not cross: the next clip can be
 *   another page or tab;
 * - `off` when the user removed its zoom (zoom-edits.json), so the preview and
 *   the export both leave it out.
 */
export async function readZoomTrack(dir) {
  const manifest = await readJson(path.join(dir, 'segments.json'));
  if (!manifest?.viewport) return null;
  const rawSteps = await readJson(path.join(dir, 'steps.json'));
  const actions = new Map(
    (Array.isArray(rawSteps) ? rawSteps : (rawSteps?.steps ?? [])).map((s) => [s.id, s.action])
  );
  const off = new Set((await readJson(path.join(dir, ZOOM_EDITS_FILE)))?.off ?? []);
  const events = (manifest.segments ?? []).flatMap((segment) => {
    const action = (segment.stepIds ?? []).map((id) => actions.get(id)).find(Boolean);
    return (segment.events ?? []).map((event) => ({
      ...event,
      ...(action ? { action } : {}),
      clipStartMs: segment.startMs,
      clipEndMs: segment.endMs,
      ...(off.has(event.ms) ? { off: true } : {}),
    }));
  });
  if (events.length === 0) return null;
  return { viewport: manifest.viewport, events };
}

/**
 * Saves which zooms the user removed, by the video time of the events they
 * zoom on, and returns the track as it now is.
 */
export async function saveZoomOff(dir, offMs) {
  const off = [...new Set((Array.isArray(offMs) ? offMs : []).filter(Number.isFinite))];
  await fs.writeFile(path.join(dir, ZOOM_EDITS_FILE), JSON.stringify({ off }, null, 2));
  return readZoomTrack(dir);
}
