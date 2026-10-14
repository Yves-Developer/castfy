import fs from 'node:fs/promises';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { getVideoMetadata, renderMedia, selectComposition } from '@remotion/renderer';
import { findHeadlessShell } from './browsers.js';

/**
 * Local export.
 *
 * The whole reason the desktop pivot pays for itself: rendering was the most
 * expensive thing Castfy did in the cloud, and here it runs on the user's
 * machine for nothing.
 */

const FPS = 30;

/** Best variant first — the export should carry narration when there is any. */
const SOURCE_PREFERENCE = [
  'demo-with-audio-clean.mp4',
  'demo-with-audio.mp4',
  'demo-clean.webm',
  'demo.webm',
];

/**
 * Untrimmed footage, best first, for when the cut is applied at render time.
 *
 * These carry no narration: the audio variants are built against the clean
 * cut's timings, so pairing them with a different cut would desync the voice.
 * A trimmed export is silent until narration can be re-timed.
 */
const UNCUT_SOURCE_PREFERENCE = ['demo-source.mp4', 'demo.webm'];

/**
 * The kept spans for a cut, in source time.
 *
 * `cuts` are the ranges to remove. Passing them rather than keep ranges matches
 * what the editor edits, and inverting here means one definition of "the gaps
 * between the cuts" instead of two that can disagree.
 */
function keepRangesFromCuts(cuts, totalDurationMs) {
  const ordered = [...cuts]
    .filter((cut) => cut.endMs > cut.startMs)
    .sort((a, b) => a.startMs - b.startMs);

  const keeps = [];
  let cursor = 0;

  for (const cut of ordered) {
    // Overlapping cuts are normal after dragging; take the union by only ever
    // moving the cursor forward.
    if (cut.startMs > cursor) {
      keeps.push({ id: `keep-${cursor}`, startMs: cursor, endMs: Math.min(cut.startMs, totalDurationMs) });
    }
    cursor = Math.max(cursor, cut.endMs);
    if (cursor >= totalDurationMs) break;
  }

  if (cursor < totalDurationMs) {
    keeps.push({ id: `keep-${cursor}`, startMs: cursor, endMs: totalDurationMs });
  }

  return keeps.filter((keep) => keep.endMs > keep.startMs);
}

/** Cached bundles, keyed by what their publicDir contained when built. */
const bundles = new Map();

/**
 * Bundles once per session, keyed on that session's contents.
 *
 * Two things forced this shape. bundle() *copies* publicDir into its output, so
 * a file added afterwards is invisible however correct the path looks — which is
 * how a freshly copied background produced "Error loading image". And pointing
 * publicDir at the library root meant every export copied every recording, so
 * the bundle grew with the library.
 *
 * Keying on the file list means a new asset produces a new bundle instead of
 * silently reusing one that predates it.
 */
export async function getSessionBundle({ entryPoint, sessionDir, key }) {
  const existing = bundles.get(key);
  if (existing) return existing;

  const promise = bundle({ entryPoint, publicDir: sessionDir });
  bundles.set(key, promise);
  try {
    return await promise;
  } catch (err) {
    // Never cache a failure: the next attempt should be able to succeed.
    bundles.delete(key);
    throw err;
  }
}

async function firstExisting(dir, candidates) {
  for (const name of candidates) {
    try {
      await fs.access(path.join(dir, name));
      return name;
    } catch {
      // keep looking
    }
  }
  return null;
}

/**
 * Copies an asset from the app's own bundle into the session folder.
 *
 * Remotion resolves staticFile() against one publicDir, and that is the session
 * — the only place the recording itself lives. Background images and overlays
 * ship in the app's public/, so the ones a render needs are brought across
 * rather than reaching for a second root.
 */
async function materialiseAsset(publicRoot, sessionDir, assetPath) {
  if (!assetPath) return null;
  // Remote or in-memory sources cannot be resolved from here.
  if (/^(https?:|blob:|data:)/.test(assetPath)) return null;

  const clean = assetPath.replace(/^\/+/, '');
  const from = path.resolve(publicRoot, clean);
  if (!from.startsWith(path.resolve(publicRoot))) return null;

  try {
    await fs.access(from);
  } catch {
    return null;
  }

  const renderDir = path.join(sessionDir, 'render-assets');
  await fs.mkdir(renderDir, { recursive: true });
  const fileName = clean.replace(/[\\/]/g, '_');
  await fs.copyFile(from, path.join(renderDir, fileName));

  return `render-assets/${fileName}`;
}

export async function exportRecording({
  sessionId,
  libraryRoot,
  entryPoint,
  publicRoot,
  outputFile = 'demo-export.mp4',
  /** Resolved CSS for the background — colour or gradient. */
  backgroundCss = '#0f172a',
  /** App-relative background image path, e.g. "/raycast/red_distortion_4.webp". */
  backgroundImage = null,
  overlays = [],
  padding = 4,
  radius = 12,
  width = 1920,
  height = 1080,
  /**
   * Ranges to remove, in raw-footage time. Given these, the export renders from
   * the untrimmed capture and applies the cut itself, so no clean file has to
   * exist first. Omitted, it exports the most finished file on disk — which is
   * what every export did before, narration included.
   */
  cuts = null,
  browsersPath,
  onProgress,
}) {
  const sessionDir = path.join(libraryRoot, sessionId);

  const trimming = Array.isArray(cuts) && cuts.length > 0;
  const sourceFile = await firstExisting(
    sessionDir,
    trimming ? UNCUT_SOURCE_PREFERENCE : SOURCE_PREFERENCE
  );
  if (!sourceFile) throw new Error('This recording has no video to export.');

  const source = path.join(sessionDir, sourceFile);
  const { durationInSeconds } = await getVideoMetadata(source);
  const durationInFrames = Math.max(1, Math.round(durationInSeconds * FPS));
  const keeps = trimming ? keepRangesFromCuts(cuts, durationInSeconds * 1000) : [];

  if (trimming && keeps.length === 0) {
    throw new Error('That edit removes the whole recording.');
  }

  onProgress?.('Preparing assets…');
  const bgAsset = await materialiseAsset(publicRoot, sessionDir, backgroundImage);
  const overlaySpecs = [];
  for (const overlay of overlays) {
    const src = await materialiseAsset(publicRoot, sessionDir, overlay.src);
    if (src) overlaySpecs.push({ ...overlay, src });
  }

  // Built after the assets are in place, and keyed on them, so the bundle can
  // never be the one from before they existed.
  const assetNames = [bgAsset, ...overlaySpecs.map((o) => o.src)].filter(Boolean).sort();
  const serveUrl = await getSessionBundle({
    entryPoint,
    sessionDir,
    key: `${sessionId}|${sourceFile}|${assetNames.join(',')}`,
  });
  const browserExecutable = await findHeadlessShell(browsersPath);

  const inputProps = {
    // Relative to the session, which is this bundle's publicDir.
    src: sourceFile,
    backgroundCss,
    backgroundImage: bgAsset,
    overlays: overlaySpecs,
    padding,
    radius,
    durationInFrames,
    width,
    height,
    keeps,
  };

  onProgress?.('Rendering…');
  const composition = await selectComposition({
    serveUrl,
    id: 'Demo',
    inputProps,
    browserExecutable,
  });

  const outputLocation = path.join(sessionDir, outputFile);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
    browserExecutable,
    onProgress: onProgress ? ({ progress }) => onProgress(`${Math.round(progress * 100)}%`) : undefined,
  });

  const { size } = await fs.stat(outputLocation);
  return {
    outputLocation,
    size,
    sourceFile,
    // What the render actually produced, which is the composition's length when
    // trimming rather than the source's.
    durationInFrames: composition.durationInFrames,
    keptRanges: keeps.length,
    sourceDurationInFrames: durationInFrames,
    width,
    height,
    hasBackgroundImage: Boolean(bgAsset),
    overlays: overlaySpecs.length,
  };
}
