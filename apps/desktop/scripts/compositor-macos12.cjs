/**
 * Lets Remotion's compositor start on macOS 12 to 14.
 *
 * Since Remotion 4.0.439 the compositor's libavdevice.dylib imports camera
 * types Apple added in macOS 13 and 14 (Continuity Camera, Desk View, ...).
 * On an older Mac dyld cannot find them and aborts the compositor before it
 * starts, so export failed with "Compositor exited with signal SIGABRT".
 *
 * Those imports belong to ffmpeg's webcam capture, which export never uses,
 * and they are the only system symbols the compositor gained over 4.0.250,
 * the last release built for macOS 12. Marking them weak makes dyld bind a
 * missing one to null instead of aborting.
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');

/** AVFoundation symbols newer than macOS 12. */
const NEWER_THAN_MACOS_12 = new Set([
  '_AVCaptureDeviceTypeContinuityCamera',
  '_AVCaptureDeviceTypeDeskViewCamera',
  '_AVCaptureDeviceTypeExternal',
  '_AVCaptureDeviceTypeMicrophone',
]);

const MH_MAGIC_64 = 0xfeedfacf;
const LC_DYLD_CHAINED_FIXUPS = 0x80000034;

/** Marks the imports in NEWER_THAN_MACOS_12 weak. Returns how many it newly marked. */
function weakenImports(buffer) {
  if (buffer.readUInt32LE(0) !== MH_MAGIC_64) throw new Error('not a thin 64-bit Mach-O');
  let offset = 32;
  let fixups = null;
  for (let i = 0, count = buffer.readUInt32LE(16); i < count; i++) {
    if (buffer.readUInt32LE(offset) === LC_DYLD_CHAINED_FIXUPS) fixups = buffer.readUInt32LE(offset + 8);
    offset += buffer.readUInt32LE(offset + 4);
  }
  if (fixups === null) throw new Error('no chained fixups');

  // dyld_chained_fixups_header
  const imports = fixups + buffer.readUInt32LE(fixups + 8);
  const symbols = fixups + buffer.readUInt32LE(fixups + 12);
  const count = buffer.readUInt32LE(fixups + 16);
  const format = buffer.readUInt32LE(fixups + 20);
  const nameAt = (nameOffset) => {
    const start = symbols + nameOffset;
    return buffer.toString('latin1', start, buffer.indexOf(0, start));
  };

  let marked = 0;
  for (let i = 0; i < count; i++) {
    if (format === 1 || format === 2) {
      // lib_ordinal:8, weak_import:1, name_offset:23 (format 2 adds an addend).
      const at = imports + i * (format === 1 ? 4 : 8);
      const entry = buffer.readUInt32LE(at);
      if (!(entry & 0x100) && NEWER_THAN_MACOS_12.has(nameAt(entry >>> 9))) {
        buffer.writeUInt32LE((entry | 0x100) >>> 0, at);
        marked++;
      }
    } else if (format === 3) {
      // lib_ordinal:16, weak_import:1, reserved:15, name_offset:32, addend:64.
      const at = imports + i * 16;
      const entry = buffer.readUInt32LE(at);
      if (!(entry & 0x10000) && NEWER_THAN_MACOS_12.has(nameAt(buffer.readUInt32LE(at + 4)))) {
        buffer.writeUInt32LE((entry | 0x10000) >>> 0, at);
        marked++;
      }
    } else {
      throw new Error(`unknown chained imports format ${format}`);
    }
  }
  return marked;
}

/** Patches the compositor's libavdevice in a packaged app's node_modules. */
async function patchCompositorForMacos12(appNodeModules) {
  const scope = path.join(appNodeModules, '@remotion');
  const packages = (await fs.readdir(scope).catch(() => [])).filter((p) =>
    p.startsWith('compositor-darwin-')
  );
  if (packages.length === 0) console.warn('  • compositor for macOS 12  no compositor found to patch');
  for (const pkg of packages) {
    const file = path.join(scope, pkg, 'libavdevice.dylib');
    let buffer;
    try {
      buffer = await fs.readFile(file);
    } catch {
      continue;
    }
    const marked = weakenImports(buffer);
    if (marked === 0) continue;
    await fs.writeFile(file, buffer);
    // Apple Silicon only runs signed code, and the patch broke the linker's
    // ad-hoc signature. Intel's copy is unsigned and runs as it is.
    if (process.platform === 'darwin' && pkg.endsWith('arm64')) {
      execFileSync('codesign', ['--force', '--sign', '-', file]);
    }
    console.log(`  • compositor for macOS 12  ${pkg}: ${marked} imports made weak`);
  }
}

module.exports = { patchCompositorForMacos12, weakenImports };
