import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertSupportedNode, root } from './utils.mjs';

try {
  assertSupportedNode();
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  console.log(`Node: ${process.versions.node}`);
  console.log(`Angular framework: ${pkg.dependencies['@angular/core']}`);
  console.log(`Angular CLI/build: ${pkg.devDependencies['@angular/cli']}`);
  console.log(`Jest: ${pkg.devDependencies['jest']}; Angular preset: ${pkg.devDependencies['jest-preset-angular']}`);
  if (!existsSync(join(root, 'node_modules/@angular/core/package.json'))) {
    throw new Error('Dependencies are missing. Run npm run setup.');
  }
  const installed = JSON.parse(readFileSync(join(root, 'node_modules/@angular/core/package.json'), 'utf8'));
  if (installed.version !== pkg.dependencies['@angular/core']) throw new Error('Installed Angular does not match package.json. Run npm run setup.');
  console.log('Workspace prerequisites look correct.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
