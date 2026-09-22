import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProject } from '../packages/create-verse-bot/dist/index.js';

const root = mkdtempSync(join(tmpdir(), 'verse-bot-cli-'));
const cases = [
  ['telegram', ['telegram']],
  ['vk', ['vk']],
  ['both', ['telegram', 'vk']],
];

try {
  for (const [name, platforms] of cases) {
    process.chdir(root);
    const projectDir = createProject({
      projectName: name,
      platforms,
      useLocal: true,
      install: false,
    });
    const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
    const source = readFileSync(join(projectDir, 'src/index.ts'), 'utf8');
    const dependencies = Object.keys(packageJson.dependencies).sort();

    assert.deepEqual(
      dependencies,
      [
        '@verse-bot/core',
        '@verse-bot/postgres',
        ...platforms.map((platform) => `@verse-bot/${platform}`),
      ].sort(),
    );
    assert.equal(source.includes('@verse-bot:telegram:'), false);
    assert.equal(source.includes('@verse-bot:vk:'), false);
    assert.equal(source.includes('pool,'), false);
    assert.equal(source.includes('database,'), true);

    execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: projectDir,
      stdio: 'inherit',
    });
    execFileSync('npm', ['run', 'build'], { cwd: projectDir, stdio: 'inherit' });
  }

  console.log('CLI generation smoke test passed');
} finally {
  rmSync(root, { recursive: true, force: true });
}
