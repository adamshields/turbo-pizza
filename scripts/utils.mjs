import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));

export function assertSupportedNode() {
  const [major, minor, patch] = process.versions.node.split('.').map(Number);
  const supported = (major === 22 && (minor > 22 || (minor === 22 && patch >= 3))) ||
    (major === 24 && minor >= 15) || major >= 26;
  if (!supported) {
    throw new Error(`Node ${process.versions.node} is not supported by Angular 22. Use Node 24.15+ ("nvm install 24 && nvm use 24").`);
  }
}

export function runNpm(args) {
  const npmCli = process.env['npm_execpath'];
  const command = npmCli ? process.execPath : (process.platform === 'win32' ? 'npm.cmd' : 'npm');
  const result = spawnSync(command, npmCli ? [npmCli, ...args] : args, {
    cwd: root, stdio: 'inherit', shell: !npmCli && process.platform === 'win32',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed (exit ${result.status ?? 'unknown'}).`);
}
