import { mkdirSync, existsSync, readFileSync, writeFileSync, rmSync, openSync, closeSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { root } from './utils.mjs';

const dir = join(root, '.cache');
const pidFile = join(dir, 'dev.pid');
mkdirSync(dir, { recursive: true });
const previous = existsSync(pidFile) ? Number(readFileSync(pidFile, 'utf8')) : 0;
let running = false;
if (previous > 0) { try { process.kill(previous, 0); running = true; } catch {} }

async function openAppInBrowser() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4200/', { signal: AbortSignal.timeout(1000) });
      if (response.ok) break;
    } catch {}
    await delay(250);
  }

  const opener = spawn('code', ['--open-url', 'http://localhost:4200'], {
    cwd: root,
    detached: true,
    stdio: 'ignore',
  });
  opener.once('error', (error) => console.error(`Could not open the app automatically: ${error.message}`));
  opener.unref();
}

if (process.argv.includes('--stop')) {
  if (running) process.kill(previous, 'SIGTERM');
  rmSync(pidFile, { force: true });
  console.log(running ? 'Stopped the auto-started development session.' : 'No auto-started session was running.');
} else if (running) {
  console.log('Development session is already running. Opening port 4200; logs: .cache/dev.log');
  await openAppInBrowser();
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
  console.log('Development launch requested. Opening port 4200 after Angular finishes compiling. Logs: .cache/dev.log');
  await openAppInBrowser();
}
