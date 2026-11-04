/**
 * Notarizes and staples the signed macOS app (electron-builder's afterSign).
 *
 * electron-builder's own notarization (mac.notarize, off in
 * electron-builder.yml) sends the app and staples the ticket in one go, with
 * no retry. Twice on beta.21 the Intel build was notarized by Apple and then
 * failed at stapling, because the connection to Apple's ticket server dropped
 * ("The network connection was lost", stapler Error 68). Each time the whole
 * 50-minute build had to run again. Here the upload, the wait for Apple's
 * verdict and the stapling each retry on such errors; a verdict of Invalid
 * does not, and fails with Apple's log.
 *
 * Runs only when the App Store Connect key is set (APPLE_API_KEY,
 * APPLE_API_KEY_ID, APPLE_API_ISSUER; see .github/workflows/desktop-release.yml).
 * Without it the app stays signed but not notarized, as before.
 */
const { execFile } = require('node:child_process');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { promisify } = require('node:util');

const run = promisify(execFile);

/** Waits between tries, ms: about 7.5 minutes in all before giving up. */
const BACKOFF_MS = [15_000, 30_000, 60_000, 120_000, 240_000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs a command, retrying while it fails; the last failure is thrown. */
async function withRetries(label, attempt) {
  for (let i = 0; ; i++) {
    try {
      return await attempt();
    } catch (error) {
      if (error.permanent || i >= BACKOFF_MS.length) throw error;
      const wait = BACKOFF_MS[i];
      console.log(`  • ${label} failed (try ${i + 1}), retrying in ${wait / 1000}s: ${firstLine(error)}`);
      await sleep(wait);
    }
  }
}

function firstLine(error) {
  const text = `${error.stderr || ''}${error.stdout || ''}${error.message || ''}`.trim();
  return text.split('\n').find((line) => line.trim()) ?? 'unknown error';
}

async function notarytool(args, auth) {
  const { stdout } = await run('xcrun', ['notarytool', ...args, ...auth, '--output-format', 'json'], {
    maxBuffer: 16 * 1024 * 1024,
  });
  return JSON.parse(stdout);
}

exports.default = async function notarizeApp(context) {
  if (context.electronPlatformName !== 'darwin') return;
  const { APPLE_API_KEY, APPLE_API_KEY_ID, APPLE_API_ISSUER } = process.env;
  if (!(APPLE_API_KEY && APPLE_API_KEY_ID && APPLE_API_ISSUER)) {
    console.log('  • not notarizing: no App Store Connect API key');
    return;
  }

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  const auth = ['--key', APPLE_API_KEY, '--key-id', APPLE_API_KEY_ID, '--issuer', APPLE_API_ISSUER];

  // notarytool takes a zip; ditto keeps the bundle's symlinks and attributes.
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'castfy-notarize-'));
  const zip = path.join(dir, 'Castfy.zip');
  try {
    await run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appPath, zip]);

    console.log('  • notarizing: uploading to Apple');
    const submitted = await withRetries('upload', () => notarytool(['submit', zip], auth));
    const id = submitted.id;
    if (!id) throw new Error(`notarytool did not return a submission id: ${JSON.stringify(submitted)}`);
    console.log(`  • notarizing: submission ${id}, waiting for Apple`);

    // A dropped connection ends `wait` early; the submission carries on at
    // Apple, so waiting again picks it up where it is.
    const verdict = await withRetries('wait', () => notarytool(['wait', id], auth));
    if (verdict.status !== 'Accepted') {
      const log = await notarytool(['log', id], auth).catch(() => null);
      const error = new Error(
        `Apple did not accept the app (${verdict.status}): ${JSON.stringify(log?.issues ?? log ?? verdict)}`
      );
      error.permanent = true;
      throw error;
    }
    console.log('  • notarizing: accepted');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }

  // The ticket can take a moment to reach Apple's ticket server, and the
  // server's connection is what dropped on beta.21.
  await withRetries('staple', () => run('xcrun', ['stapler', 'staple', appPath]));
  await run('xcrun', ['stapler', 'validate', appPath]);
  console.log('  • notarizing: stapled');
};
