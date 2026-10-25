import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { assertSupportedNode, root } from './utils.mjs';
import { createApiServer } from '../mock-api/server.mjs';

try { assertSupportedNode(); }
catch (error) { console.error(error.message); process.exit(1); }
const cli = join(root, 'node_modules/@angular/cli/bin/ng.js');
if (!existsSync(cli)) { console.error('Run npm run setup first.'); process.exit(1); }
let web;
let stopping = false;
const api = createApiServer({ log: true });
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  web?.kill('SIGTERM');
  api.close();
  api.closeAllConnections();
  setTimeout(() => { web?.kill('SIGKILL'); process.exit(code); }, 3000).unref();
}
api.on('error', (error) => { console.error(`Mock API could not start: ${error.message}`); stop(1); });
api.listen(3001, '127.0.0.1', () => {
  console.log('Mock API ready on port 3001. Starting Angular on port 4200...');
  web = spawn(process.execPath, [cli, 'serve', '--host', '0.0.0.0', '--port', '4200'], { cwd: root, stdio: 'inherit' });
  web.on('error', (error) => { console.error(error.message); stop(1); });
  web.on('exit', (code) => { if (!stopping) stop(code ?? 1); });
});
process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
