import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * A problem report: one zip a tester can drop into Discord, with what is
 * needed to see what went wrong in their last recording.
 *
 * Left out on purpose: the raw clip pieces (segments/), step screenshots
 * (assets/) and the uncut capture, which are large and rarely needed, and the
 * export, which is the same picture as demo.mp4.
 */
const SKIPPED = new Set(['segments', 'assets', 'live.jpg']);
const SKIPPED_EXTENSIONS = new Set(['.webm']);
const SKIPPED_FILES = new Set(['demo-source.mp4', 'demo-export.mp4']);

/** Runs kept in the report, newest first. */
const RECENT_RUNS = 10;

const ZIP_EXTENSION = /\.zip$/;

async function copyRecording(from, to) {
  await fs.mkdir(to, { recursive: true });
  for (const entry of await fs.readdir(from, { withFileTypes: true })) {
    const name = entry.name;
    if (SKIPPED.has(name) || SKIPPED_FILES.has(name)) {
      continue;
    }
    if (SKIPPED_EXTENSIONS.has(path.extname(name))) {
      continue;
    }
    const source = path.join(from, name);
    const target = path.join(to, name);
    if (entry.isDirectory()) {
      await fs.cp(source, target, { recursive: true });
    } else if (entry.isFile()) {
      await fs.copyFile(source, target);
    }
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Zips a folder's contents with the system's own tool: ditto on macOS, the
 * bsdtar Windows 10+ ships, zip on Linux. Falls back to .tar.gz where there
 * is no zip tool. Returns the archive's path.
 */
async function archive(folder, zipPath) {
  if (process.platform === 'darwin') {
    await execFileAsync('ditto', ['-c', '-k', folder, zipPath]);
    return zipPath;
  }
  if (process.platform === 'win32') {
    await execFileAsync('tar', ['-a', '-c', '-f', zipPath, '-C', folder, '.']);
    return zipPath;
  }
  try {
    await execFileAsync('zip', ['-r', '-q', zipPath, '.'], { cwd: folder });
    return zipPath;
  } catch {
    const tarPath = zipPath.replace(ZIP_EXTENSION, '.tar.gz');
    await execFileAsync('tar', ['-czf', tarPath, '-C', folder, '.']);
    return tarPath;
  }
}

/** '2026-10-31 1704', for the file name. */
function stamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}${pad(date.getMinutes())}`;
}

/**
 * Builds the report and returns where it was saved.
 *
 * @param {object} opts
 * @param {string | null} opts.sessionDir  the recording to include, if any
 * @param {string} opts.userData           Castfy's own folder (runs.json, settings.json)
 * @param {string} opts.outDir             where the zip goes (Downloads)
 * @param {object} opts.info               report.json: version, platform, agent, plan…
 */
export async function buildReport({ sessionDir, userData, outDir, info }) {
  const now = new Date();
  const name = `Castfy report ${stamp(now)}`;
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), 'castfy-report-'));
  try {
    const folder = path.join(staging, name);
    await fs.mkdir(folder, { recursive: true });

    if (sessionDir) {
      await copyRecording(
        sessionDir,
        path.join(folder, path.basename(sessionDir))
      );
    }

    const runs = await readJson(path.join(userData, 'runs.json'));
    if (runs?.runs) {
      const recent = [...runs.runs]
        .sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0))
        .slice(0, RECENT_RUNS);
      await fs.writeFile(
        path.join(folder, 'runs.json'),
        JSON.stringify(recent, null, 2)
      );
    }
    const settings = await readJson(path.join(userData, 'settings.json'));
    if (settings) {
      await fs.writeFile(
        path.join(folder, 'settings.json'),
        JSON.stringify(settings, null, 2)
      );
    }

    await fs.writeFile(
      path.join(folder, 'report.json'),
      JSON.stringify(
        {
          createdAt: now.toISOString(),
          recording: sessionDir ? path.basename(sessionDir) : null,
          ...info,
        },
        null,
        2
      )
    );

    await fs.mkdir(outDir, { recursive: true });
    return await archive(folder, path.join(outDir, `${name}.zip`));
  } finally {
    await fs.rm(staging, { recursive: true, force: true });
  }
}
