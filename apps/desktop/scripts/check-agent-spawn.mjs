/**
 * Checks that an agent behind a .cmd shim gets its arguments whole, with
 * spaces in its own path and in an argument's: the case of npm's claude.cmd
 * for a Windows user named "Jean Paul" (agentSpawn, platform.js).
 *
 * Windows only; elsewhere it says so and passes. Run by CI on windows-latest:
 *   node apps/desktop/scripts/check-agent-spawn.mjs
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { agentSpawn } from '../platform.js';

if (process.platform !== 'win32') {
  console.log('check-agent-spawn: not Windows, nothing to check');
  process.exit(0);
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'castfy spawn '));
const bin = path.join(root, 'Jean Paul', 'npm');
fs.mkdirSync(bin, { recursive: true });
const printer = path.join(root, 'print-args.cjs');
fs.writeFileSync(printer, 'process.stdout.write(JSON.stringify(process.argv.slice(2)));');
// A stand-in for claude.cmd: hands its arguments to node, which prints them.
const shim = path.join(bin, 'claude.cmd');
fs.writeFileSync(shim, `@echo off\r\n"${process.execPath}" "${printer}" %*\r\n`);

const config = path.join(root, 'Jean Paul', 'AppData', 'Roaming', 'Castfy', 'castfy0-run-mcp.json');
const args = ['-p', '--output-format', 'json', '--allowedTools', 'mcp__castfy0', '--mcp-config', config, '--strict-mcp-config'];

const launch = agentSpawn(shim, args);
const result = spawnSync(launch.file, launch.args, { shell: launch.shell, encoding: 'utf8' });
fs.rmSync(root, { recursive: true, force: true });

if (result.status !== 0) {
  console.error('check-agent-spawn: the shim did not run', result.status, result.stderr);
  process.exit(1);
}
const received = JSON.parse(result.stdout);
if (JSON.stringify(received) !== JSON.stringify(args)) {
  console.error('check-agent-spawn: arguments arrived changed');
  console.error('sent    ', args);
  console.error('received', received);
  process.exit(1);
}
console.log('check-agent-spawn: passed, every argument arrived whole');
