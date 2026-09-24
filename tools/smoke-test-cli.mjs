import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, rmSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProject } from '../packages/create-verse-bot/dist/index.js';

const root = mkdtempSync(join(tmpdir(), 'verse-bot-cli-'));
const useLocal = process.argv.includes('--local');
const skipInstall = process.argv.includes('--skip-install');
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
      useLocal,
      install: false,
    });
    const packageJson = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
    const source = readFileSync(join(projectDir, 'src/index.ts'), 'utf8');
    assert.equal(packageJson.scripts.lint, 'tsc --noemit');
    assert.equal(existsSync(join(projectDir, 'LICENSE')), true);
    const dependencies = Object.keys(packageJson.dependencies).sort();

    assert.deepEqual(
      dependencies,
      [
        '@verse-bot/core',
        '@verse-bot/postgres',
        ...platforms.map((platform) => `@verse-bot/${platform}`),
      ].sort(),
    );
    const expectedVersion = useLocal ? /^file:/ : /^\^0\.1\.0$/;
    for (const dependency of dependencies) {
      assert.match(
        packageJson.dependencies[dependency],
        expectedVersion,
        `${dependency} must use ${useLocal ? 'a local package' : 'the published version range'}`,
      );
    }
    assert.equal(source.includes('@verse-bot:telegram:'), false);
    assert.equal(source.includes('@verse-bot:vk:'), false);
    assert.equal(source.includes('pool,'), false);
    assert.equal(source.includes('database,'), true);

    if (!skipInstall) {
      execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], {
        cwd: projectDir,
        stdio: 'inherit',
      });
      execFileSync('npm', ['run', 'build'], { cwd: projectDir, stdio: 'inherit' });
      execFileSync('npm', ['run', 'lint'], { cwd: projectDir, stdio: 'inherit' });
    }
  }

  console.log(
    `CLI generation smoke test passed (${useLocal ? 'local' : 'published'} dependencies${
      skipInstall ? ', config only' : ''
    })`,
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
