import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Re-renders a recording's clean cut from the user's own edit.
 *
 * The engine's trim is a proposal, not a verdict: someone should be able to say
 * "that cut took a beat too much" and get it back. This runs entirely locally —
 * no agent, no re-recording — because castfy0 already exposes the same
 * functions its packager uses, and the raw footage never changed.
 */

/** Loaded from the bundled engine so the maths matches how it was cut first time. */
async function engine(entryPoint) {
  const root = path.dirname(entryPoint);
  const load = (rel) => import(pathToFileURL(path.join(root, rel)).href);

  const [timeline, videoClean] = await Promise.all([
    load('editor/timeline.js'),
    load('generator/video-clean.js'),
  ]);

  return {
    computeKeepRanges: timeline.computeKeepRanges,
    mergeCutRanges: timeline.mergeCutRanges,
    coalesceShortKeeps: timeline.coalesceShortKeeps,
    remapTime: timeline.remapTime,
    generateCleanVideo: videoClean.generateCleanVideo,
  };
}





/**
 * @param cuts  The ranges to remove, in raw-footage time. Normalised here, so a
 *              caller can hand over overlapping or tiny ranges from dragging.
 */
export async function recutSession({ sessionDir, entryPoint, cuts, onProgress }) {
  const source = path.join(sessionDir, 'demo.webm');
  await fs.access(source);

  const { computeKeepRanges, mergeCutRanges, generateCleanVideo } = await engine(entryPoint);

  const edits = JSON.parse(await fs.readFile(path.join(sessionDir, 'edits.json'), 'utf8'));
  const totalDurationMs = edits.totalDurationMs;

  /**
   * Overlaps from dragging get merged, and nothing else.
   *
   * Deliberately NOT coalesceShortKeeps: that folds together any cuts less than
   * 600ms apart, which is right for tidying the engine's own proposal and wrong
   * for a hand edit — it silently deletes the short moments someone just chose
   * to keep. On this session it collapsed nine keeps into three.
   */
  const merged = mergeCutRanges(cuts);
  const keepRanges = computeKeepRanges(totalDurationMs, merged);

  if (keepRanges.length === 0) {
    throw new Error('That edit removes the entire recording.');
  }

  onProgress?.('Rendering clean video…');
  const outputPath = path.join(sessionDir, 'demo-clean.webm');
  const rendered = await generateCleanVideo(source, keepRanges, outputPath);
  if (!rendered) throw new Error('Rendering the clean video failed.');

  // Keep the manifest honest about what produced the file on disk.
  const nextEdits = {
    ...edits,
    cutRanges: merged,
    keepRanges,
    // Preserved so the engine's original proposal can always be restored.
    aiCutRanges: edits.aiCutRanges ?? edits.cutRanges,
    editedAt: new Date().toISOString(),
  };
  await fs.writeFile(
    path.join(sessionDir, 'edits.json'),
    `${JSON.stringify(nextEdits, null, 2)}\n`,
    'utf8'
  );

  /**
   * Narration is NOT re-timed here, and must not be.
   *
   * Its timings live in a third timebase: the narrated render freezes frames to
   * fit the speech, so narration.totalDurationMs (14.4s on one session) matches
   * neither the raw footage (93.6s) nor the clean cut (7.7s). Treating those as
   * raw-footage times and remapping them collapsed six segments into two.
   *
   * Re-timing correctly means re-running the engine's narration-timing pass to
   * rebuild the hold blocks. Until that is wired, the silent clean cut is
   * rebuilt and the narrated variants are reported stale rather than corrupted.
   */
  const narration = await fs
    .readFile(path.join(sessionDir, 'narration.json'), 'utf8')
    .then(JSON.parse)
    .catch(() => null);
  const narrationStale = Boolean(narration?.segments?.length);

  const { size } = await fs.stat(outputPath);
  return {
    outputPath,
    size,
    cuts: merged.length,
    keeps: keepRanges.length,
    cleanDurationMs: keepRanges.reduce((sum, k) => sum + (k.endMs - k.startMs), 0),
    narrationStale,
  };
}
