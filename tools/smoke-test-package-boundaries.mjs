import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

function readPackage(packagePath) {
  return JSON.parse(readFileSync(resolve(root, packagePath, 'package.json'), 'utf8'));
}

const core = readPackage('packages/core');
const postgres = readPackage('packages/postgres');
const telegram = readPackage('packages/tg-core');
const vk = readPackage('packages/vk-core');

assert.deepEqual(core.dependencies ?? {}, {}, 'core must not have runtime dependencies');
assert.equal(telegram.dependencies['@verse-bot/core'], '^0.1.0');
assert.equal(vk.dependencies['@verse-bot/core'], '^0.1.0');
assert.equal(telegram.dependencies['@verse-bot/postgres'], undefined);
assert.equal(vk.dependencies['@verse-bot/postgres'], undefined);
assert.equal(telegram.dependencies.pg, undefined);
assert.equal(vk.dependencies.pg, undefined);
assert.ok(postgres.dependencies.pg, 'postgres must depend on pg');

for (const packagePath of ['packages/core', 'packages/tg-core', 'packages/vk-core']) {
  const sourceFiles = readFileSync(resolve(root, packagePath, 'package.json'), 'utf8');
  assert.ok(!sourceFiles.includes('packages/db'), `${packagePath} contains stale db references`);
}

console.log('Package boundary smoke test passed');
