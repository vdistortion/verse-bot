import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createProject } from './index.js';

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function createTemporaryWorkspace(): string {
  const directory = mkdtempSync(join(tmpdir(), 'verse-bot-cli-test-'));
  temporaryDirectories.push(directory);
  return directory;
}

describe('createProject', () => {
  it('generates published dependency ranges and removes unselected platform blocks', () => {
    const workspace = createTemporaryWorkspace();
    const previousCwd = process.cwd();
    process.chdir(workspace);

    try {
      const project = createProject({
        projectName: 'telegram-bot',
        platforms: ['telegram'],
        useLocal: false,
        install: false,
      });
      const packageJson = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'));
      const source = readFileSync(join(project, 'src/index.ts'), 'utf8');

      expect(packageJson.dependencies).toEqual({
        '@verse-bot/core': '^0.1.0',
        '@verse-bot/postgres': '^0.1.0',
        '@verse-bot/telegram': '^0.1.0',
      });
      expect(source).toContain('createUniversalTelegramBot');
      expect(source).not.toContain('createUniversalVKBot');
      expect(source).not.toContain('@verse-bot:telegram:start');
      expect(source).not.toContain('@verse-bot:vk:start');
    } finally {
      process.chdir(previousCwd);
    }
  });

  it('rejects an existing project directory', () => {
    const workspace = createTemporaryWorkspace();
    const previousCwd = process.cwd();
    process.chdir(workspace);

    try {
      createProject({ projectName: 'duplicate', platforms: [], useLocal: false, install: false });
      expect(() =>
        createProject({ projectName: 'duplicate', platforms: [], useLocal: false, install: false }),
      ).toThrow('Directory "duplicate" already exists.');
    } finally {
      process.chdir(previousCwd);
    }
  });
});
