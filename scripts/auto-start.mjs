import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, openSync, closeSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { root } from './utils.mjs';

const dir = join(root, '.cache');
const pidFile = join(dir, 'dev.pid');
mkdirSync(dir, { recursive: true });
const previous = existsSync(pidFile) ? Number(readFileSync(pidFile, 'utf8')) : 0;
let running = false;
if (previous > 0) { try { process.kill(previous, 0); running = true; } catch {} }
if (process.argv.includes('--stop')) {
  if (running) process.kill(previous, 'SIGTERM');
  rmSync(pidFile, { force: true });
  console.log(running ? 'Stopped the auto-started development session.' : 'No auto-started session was running.');
} else if (running) {
  console.log('Development session is already running. Open port 4200; logs: .cache/dev.log');
} else if (!existsSync(join(root, 'node_modules/@angular/cli/bin/ng.js'))) {
  console.error('Dependencies were not installed. Run npm run setup, then npm start.');
  process.exitCode = 1;
} else {
  const output = openSync(join(dir, 'dev.log'), 'a');
  const child = spawn(process.execPath, [join(root, 'scripts/dev.mjs')], { cwd: root, detached: true, stdio: ['ignore', output, output] });
  child.once('error', (error) => { console.error(error.message); process.exitCode = 1; });
  child.unref();
  closeSync(output);
  if (child.pid) writeFileSync(pidFile, String(child.pid));
  console.log('Development launch requested. Open port 4200 after Angular finishes compiling. Logs: .cache/dev.log');
}
