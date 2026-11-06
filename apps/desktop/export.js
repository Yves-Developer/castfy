import { createDecipheriv } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import fs from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { bundle } from '@remotion/bundler';
import { getVideoMetadata, renderMedia, selectComposition } from '@remotion/renderer';
import { findHeadlessShell } from './browsers.js';
import { readZoomTrack } from './zoom-track.js';

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
  'demo.mp4',
];

/**
 * Untrimmed footage, best first, for when the cut is applied at render time.
 *
 * These carry no narration: the audio variants are built against the clean
 * cut's timings, so pairing them with a different cut would desync the voice.
 * A trimmed export is silent until narration can be re-timed.
 */
const UNCUT_SOURCE_PREFERENCE = ['demo-source.mp4', 'demo.webm', 'demo.mp4'];

/** The free plan's watermark, in the app's public folder (remotion/Root.tsx draws it). */
const WATERMARK_IMAGE = 'castfy-watermark.png';

/**
 * A free-plan demo's clean picture: demo.mp4 carries the watermark, and
 * castfy0 keeps this copy, readable only by the app (castfy0
 * src/generator/clean-vault.ts). AES-256-CTR: the magic, the IV, then the
 * ciphertext.
 */
const CLEAN_VAULT_FILE = '.demo-clean.castfy';
const VAULT_MAGIC = Buffer.from('CFV1');

/**
 * Decrypts a demo's clean picture next to the render's other assets, for the
 * export to render from. Null when the demo has none or it cannot be read
 * with this key: the export then uses demo.mp4 as it is.
 */
async function openCleanVault(sessionDir, key) {
  if (!key) return null;
  const vaultPath = path.join(sessionDir, CLEAN_VAULT_FILE);
  let handle;
  try {
    handle = await fs.open(vaultPath, 'r');
  } catch {
    return null;
  }
  try {
    const header = Buffer.alloc(VAULT_MAGIC.length + 16);
    await handle.read(header, 0, header.length, 0);
    if (!header.subarray(0, VAULT_MAGIC.length).equals(VAULT_MAGIC)) return null;
    const iv = header.subarray(VAULT_MAGIC.length);
    const renderDir = path.join(sessionDir, 'render-assets');
    await fs.mkdir(renderDir, { recursive: true });
    const out = path.join(renderDir, 'demo-clean.mp4');
    await pipeline(
      createReadStream(vaultPath, { start: header.length }),
      createDecipheriv('aes-256-ctr', key, iv),
      createWriteStream(out)
    );
    return 'render-assets/demo-clean.mp4';
  } catch {
    return null;
  } finally {
    await handle.close();
  }
}

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

/**
 * How many frames Remotion draws at once. Its default is half the CPU
 * cores; drawing frames in the headless browser is what an export spends its
 * time on (encoding is a few percent), so using all but one core is about a
 * quarter faster: 115s down to 87s for a 28s demo on 4 cores. One core stays
 * free for the app. Capped, as each one is a browser tab holding frames.
 */
function renderConcurrency() {
  const cores = os.availableParallelism?.() ?? os.cpus().length;
  return Math.max(1, Math.min(cores - 1, 8));
}

/**
 * A port for Remotion's local server, picked by the system from its
 * ephemeral range (49152 and up on Windows and macOS).
 *
 * Left to itself Remotion starts at 3000, the port every dev server uses. On
 * Windows its free-port check can pass while a dev server holds
 * localhost:3000 on another address, and the render then loaded that server's
 * page: "not a valid Remotion project … Does this look like a foreign page?"
 * on a tester's machine running a Next.js app.
 */
function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

/** Blur boxes as the composition takes them: in range, and nothing else. */
function cleanBlurs(blurs) {
  if (!Array.isArray(blurs)) return [];
  const unit = (n) => Math.min(1, Math.max(0, Number(n) || 0));
  return blurs
    .map((b, i) => ({
      id: String(b?.id ?? `blur-${i}`),
      x: unit(b?.x),
      y: unit(b?.y),
      w: unit(b?.w),
      h: unit(b?.h),
      startMs: Math.max(0, Number(b?.startMs) || 0),
      endMs: Math.max(0, Number(b?.endMs) || 0),
    }))
    .filter((b) => b.w > 0 && b.h > 0 && b.endMs > b.startMs);
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
  /** Blur boxes from the studio (remotion/blur.tsx), timed in the finished video. */
  blurs = [],
  /** Draw the free plan's watermark (billing.beginExport says when). */
  watermark = false,
  /** The install's key for free-plan demos' clean picture (main.js cleanVideoKey). */
  cleanKey = null,
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

  // demo.mp4 of a free-plan demo carries the watermark: render from its clean
  // picture instead, and draw the watermark on the frame (or not, after an
  // upgrade). Removed again once the render is done.
  const cleanCopy = sourceFile === 'demo.mp4' ? await openCleanVault(sessionDir, cleanKey) : null;
  try {
    return await renderExport({
      sessionDir, sessionId, sourceFile, renderFile: cleanCopy ?? sourceFile, entryPoint, publicRoot,
      outputFile, backgroundCss, backgroundImage, overlays, padding, radius, width, height,
      trimming, cuts, blurs, watermark, browsersPath, onProgress,
    });
  } finally {
    if (cleanCopy) await fs.rm(path.join(sessionDir, cleanCopy), { force: true });
  }
}

async function renderExport({
  sessionDir, sessionId, sourceFile, renderFile, entryPoint, publicRoot, outputFile,
  backgroundCss, backgroundImage, overlays, padding, radius, width, height,
  trimming, cuts, blurs, watermark, browsersPath, onProgress,
}) {
  const source = path.join(sessionDir, renderFile);
  const { durationInSeconds } = await getVideoMetadata(source);
  const durationInFrames = Math.max(1, Math.round(durationInSeconds * FPS));
  const keeps = trimming ? keepRangesFromCuts(cuts, durationInSeconds * 1000) : [];

  if (trimming && keeps.length === 0) {
    throw new Error('That edit removes the whole recording.');
  }

  onProgress?.('Preparing assets…');
  const bgAsset = await materialiseAsset(publicRoot, sessionDir, backgroundImage);
  const watermarkAsset = watermark
    ? await materialiseAsset(publicRoot, sessionDir, WATERMARK_IMAGE)
    : null;
  if (watermark && !watermarkAsset) throw new Error("The Castfy watermark image is missing from the app.");
  const overlaySpecs = [];
  for (const overlay of overlays) {
    const src = await materialiseAsset(publicRoot, sessionDir, overlay.src);
    if (src) overlaySpecs.push({ ...overlay, src });
  }

  // Built after the assets are in place, and keyed on them, so the bundle can
  // never be the one from before they existed.
  const assetNames = [bgAsset, watermarkAsset, ...overlaySpecs.map((o) => o.src)]
    .filter(Boolean)
    .sort();
  const serveUrl = await getSessionBundle({
    entryPoint,
    sessionDir,
    key: `${sessionId}|${renderFile}|${assetNames.join(',')}`,
  });
  const browserExecutable = await findHeadlessShell(browsersPath);

  const inputProps = {
    // Relative to the session, which is this bundle's publicDir.
    src: renderFile,
    backgroundCss,
    backgroundImage: bgAsset,
    overlays: overlaySpecs,
    padding,
    radius,
    durationInFrames,
    width,
    height,
    keeps,
    blurs: cleanBlurs(blurs),
    watermark: watermarkAsset,
    // Auto-zoom follows the recording's own clock, so only untrimmed footage
    // from the segment recorder gets it.
    zoom: !trimming && sourceFile === 'demo.mp4' ? await readZoomTrack(sessionDir) : null,
  };

  onProgress?.('Rendering…');
  const composition = await selectComposition({
    serveUrl,
    id: 'Demo',
    inputProps,
    browserExecutable,
    port: await freePort(),
  });

  const outputLocation = path.join(sessionDir, outputFile);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation,
    inputProps,
    browserExecutable,
    port: await freePort(),
    concurrency: renderConcurrency(),
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
