/**
 * Finishes the packaged app before it is signed:
 *   1. copies the staged castfy0 engine into its resources folder;
 *   2. adds the platform-native binaries electron-builder missed.
 *
 * (1) in detail:
 *
 * Done here rather than with extraResources because electron-builder strips
 * node_modules from extraResources whatever the filter says, which shipped the
 * engine without Playwright, ffmpeg or the MCP SDK. afterPack runs before
 * signing, so on macOS the copied binaries are signed with the rest of the app.
 *
 * Read at runtime as <resources>/castfy0-mcp/dist/index.js — see mcpEntry() in
 * main.js.
 */
const fs = require('node:fs/promises');
const path = require('node:path');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** The pnpm virtual store above the project, where every package really lives. */
async function findPnpmStore(fromDir) {
  let dir = fromDir;
  while (true) {
    const store = path.join(dir, 'node_modules', '.pnpm');
    if (await exists(store)) return store;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Every package folder directly inside a node_modules, scoped ones included. */
async function listPackages(nodeModules) {
  const out = [];
  for (const entry of await fs.readdir(nodeModules).catch(() => [])) {
    if (entry.startsWith('.')) continue;
    if (entry.startsWith('@')) {
      for (const scoped of await fs.readdir(path.join(nodeModules, entry)).catch(() => [])) {
        out.push(path.join(nodeModules, entry, scoped));
      }
    } else {
      out.push(path.join(nodeModules, entry));
    }
  }
  return out;
}

/**
 * Brings in the native binaries electron-builder's pnpm support leaves behind.
 *
 * Packages like @rspack/binding, esbuild and Remotion's compositor ship their
 * native code as one optional dependency per platform, and pnpm installs only
 * the one matching this machine. electron-builder does not reliably follow
 * those: the first packaged build crashed on launch with "Cannot find module
 * '@rspack/binding-linux-x64-gnu'", because Remotion's bundler loads rspack.
 *
 * So, for every bundled package that declares optional dependencies, copy in
 * whichever of them pnpm actually installed. Optional platform packages are
 * pinned to exact versions, which is what makes them findable in the store.
 */
async function addInstalledOptionalDependencies(appNodeModules, store) {
  const copied = [];
  for (const pkgDir of await listPackages(appNodeModules)) {
    let manifest;
    try {
      manifest = JSON.parse(await fs.readFile(path.join(pkgDir, 'package.json'), 'utf8'));
    } catch {
      continue;
    }
    for (const [name, version] of Object.entries(manifest.optionalDependencies ?? {})) {
      const target = path.join(appNodeModules, name);
      if (await exists(target)) continue;
      const source = path.join(store, `${name.replace('/', '+')}@${version}`, 'node_modules', name);
      if (!(await exists(source))) continue; // Another platform's: not installed here.
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.cp(source, target, { recursive: true, dereference: true });
      copied.push(`${name}@${version}`);
    }
  }
  return copied;
}

/** @param {import('electron-builder').AfterPackContext} context */
exports.default = async function afterPack(context) {
  const source = path.join(context.packager.projectDir, 'build', 'castfy0-mcp');
  // Both the engine and its dependencies: a staging that failed halfway leaves
  // dist/ in place with no node_modules, which packages fine and cannot record.
  for (const required of ['dist/index.js', 'node_modules/playwright/cli.js']) {
    try {
      await fs.access(path.join(source, required));
    } catch {
      throw new Error(
        `castfy0 is not fully staged (missing ${required}). Run \`pnpm stage:castfy0\` first.`
      );
    }
  }

  const resources =
    context.electronPlatformName === 'darwin'
      ? path.join(
          context.appOutDir,
          `${context.packager.appInfo.productFilename}.app`,
          'Contents',
          'Resources'
        )
      : path.join(context.appOutDir, 'resources');

  const target = path.join(resources, 'castfy0-mcp');
  await fs.rm(target, { recursive: true, force: true });
  await fs.cp(source, target, { recursive: true, verbatimSymlinks: true });

  const store = await findPnpmStore(context.packager.projectDir);
  if (store) {
    const copied = await addInstalledOptionalDependencies(
      path.join(resources, 'app', 'node_modules'),
      store
    );
    if (copied.length) console.log(`  • added platform binaries  ${copied.join(', ')}`);
  }
};
