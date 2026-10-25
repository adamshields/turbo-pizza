import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { assertSupportedNode, root, runNpm } from './utils.mjs';

try {
  assertSupportedNode();
  const hasLock = existsSync(join(root, 'package-lock.json'));
  console.log(hasLock ? 'Installing the committed dependency lock...' : 'First install: generating package-lock.json...');
  runNpm([hasLock ? 'ci' : 'install', '--no-audit', '--no-fund']);
  runNpm(['run', 'verify']);
  console.log('\nStarter verified. Start with npm start, then open port 4200.');
  if (!hasLock) console.log('Commit package-lock.json before creating interview sessions.');
  console.log('Challenge tests are separate and are expected to fail until the tickets are completed.');
} catch (error) {
  console.error(`\nSetup stopped: ${error.message}`);
  process.exitCode = 1;
}
