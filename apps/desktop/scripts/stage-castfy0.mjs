#!/usr/bin/env node
/**
 * Stages the castfy0 recording engine for packaging.
 *
 * The packaged app runs castfy0 from <resources>/castfy0-mcp (see mcpEntry() in
 * main.js), as a real folder outside the app archive: MCP clients start it as a
 * separate process, and it ships native binaries — ffmpeg — that cannot run from
 * inside an archive.
 *
 * This copies a built castfy0 into build/castfy0-mcp and installs its production
 * dependencies there, for the platform being packaged. ffmpeg-static downloads a
 * binary for one OS and architecture at install time, so the staging has to be
 * redone per target; that is why each release job builds on its own runner.
 *
 * Source, first match wins:
 *   CASTFY0_DIR              an explicit castfy0 checkout or install
 *   ../../../castfy0         the sibling checkout development already uses
 *
 * Target architecture: TARGET_ARCH (x64 | arm64), defaulting to this machine's.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '..');
const outDir = path.join(appDir, 'build', 'castfy0-mcp');

/** Files from the castfy0 package the runtime actually needs. */
const COPY = ['package.json', 'package-lock.json', 'dist', 'NOTICE', 'LICENSE', 'README.md'];

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findSource() {
  const candidates = [
    process.env.CASTFY0_DIR,
    path.resolve(appDir, '../../../castfy0'),
  ].filter(Boolean);

  for (const dir of candidates) {
    if (await exists(path.join(dir, 'dist', 'index.js'))) return path.resolve(dir);
  }

  const looked = candidates.map((c) => `  - ${path.resolve(c)}`).join('\n');
  throw new Error(
    `No built castfy0 found. Looked in:\n${looked}\n` +
      'Build it first (cd castfy0 && npm install && npm run build), or set CASTFY0_DIR.'
  );
}

function run(command, args, options) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    // npm is a .cmd shim on Windows, which only runs through a shell.
    shell: process.platform === 'win32',
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed (exit ${result.status})`);
  }
}

async function main() {
  const source = await findSource();
  const arch = process.env.TARGET_ARCH || process.arch;
  const { version } = JSON.parse(await fs.readFile(path.join(source, 'package.json'), 'utf8'));

  console.log(`Staging castfy0 ${version} from ${source}`);
  console.log(`  for ${process.platform}-${arch} → ${path.relative(appDir, outDir)}`);

  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });

  for (const name of COPY) {
    const from = path.join(source, name);
    if (await exists(from)) {
      await fs.cp(from, path.join(outDir, name), { recursive: true });
    }
  }

  /**
   * Installs against castfy0's own lockfile, so the app ships the exact
   * Playwright castfy0 was tested with — and with it the browser revision the
   * first-run download fetches. A fresh resolve picked up a newer Playwright,
   * asking for a Chromium castfy0 had never run against.
   *
   * `npm install`, not `npm ci`: with a lockfile present it keeps every locked
   * version and only resolves entries the lockfile lacks, where `npm ci` refuses
   * outright if castfy0's lockfile has drifted from its package.json.
   */
  const locked = await exists(path.join(outDir, 'package-lock.json'));
  if (!locked) console.warn('  castfy0 has no package-lock.json; resolving fresh versions.');
  const installArgs = ['install', '--omit=dev', '--no-audit', '--no-fund'];

  run('npm', installArgs, {
    cwd: outDir,
    env: {
      ...process.env,
      // The app downloads Chromium on first run, into its own folder.
      PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: '1',
      // ffmpeg-static picks its binary from these.
      npm_config_platform: process.platform,
      npm_config_arch: arch,
    },
  });

  const { version: playwrightVersion } = JSON.parse(
    await fs.readFile(path.join(outDir, 'node_modules', 'playwright', 'package.json'), 'utf8')
  );
  console.log(`  playwright ${playwrightVersion}`);

  const ffmpeg = path.join(
    outDir,
    'node_modules',
    'ffmpeg-static',
    process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'
  );
  if (!(await exists(ffmpeg))) {
    throw new Error(`ffmpeg-static did not install its binary (${ffmpeg}).`);
  }

  console.log(`castfy0 ${version} staged.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
