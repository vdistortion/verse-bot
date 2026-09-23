#!/usr/bin/env node
import { input, checkbox } from '@inquirer/prompts';
import path from 'node:path';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface CreateProjectOptions {
  projectName: string;
  platforms: string[];
  useLocal: boolean;
  install?: boolean;
}

export function createProject({
  projectName,
  platforms,
  useLocal,
  install = true,
}: CreateProjectOptions): string {
  const targetDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    throw new Error(`Directory "${projectName}" already exists.`);
  }

  const templateDir = path.resolve(__dirname, '../template');
  fs.copySync(templateDir, targetDir);

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = fs.readJsonSync(pkgPath);
  const packageVersion = '^0.1.0';
  const packageDirs: Record<string, string> = {
    '@verse-bot/core': 'core',
    '@verse-bot/postgres': 'postgres',
    '@verse-bot/telegram': 'telegram',
    '@verse-bot/vk': 'vk',
  };
  const resolvePackage = (name: string) =>
    useLocal ? `file:${path.resolve(__dirname, '../..', packageDirs[name])}` : packageVersion;

  pkg.dependencies = {
    '@verse-bot/core': resolvePackage('@verse-bot/core'),
    '@verse-bot/postgres': resolvePackage('@verse-bot/postgres'),
  };
  for (const platform of platforms) {
    const packageName = `@verse-bot/${platform}`;
    pkg.dependencies[packageName] = resolvePackage(packageName);
  }
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

  const indexPath = path.join(targetDir, 'src/index.ts');
  let source = fs.readFileSync(indexPath, 'utf8');
  for (const platform of ['telegram', 'vk']) {
    const block = new RegExp(
      `\\n?\\s*// @verse-bot:${platform}:start[\\s\\S]*?// @verse-bot:${platform}:end\\n?`,
      'g',
    );
    if (platforms.includes(platform)) {
      source = source
        .replace(new RegExp(`\\s*// @verse-bot:${platform}:start\\n?`, 'g'), '')
        .replace(new RegExp(`\\s*// @verse-bot:${platform}:end\\n?`, 'g'), '');
    } else {
      source = source.replace(block, '\n');
    }
  }
  fs.writeFileSync(indexPath, source);

  if (install) {
    console.log(`Project "${projectName}" created. Installing dependencies...`);
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  }

  return targetDir;
}

async function main() {
  const projectName = await input({
    message: 'Project name:',
    default: 'bot',
  });
  if (!projectName) {
    console.log('Aborted.');
    process.exit(1);
  }

  const platforms = await checkbox({
    message: 'Select platforms:',
    choices: [
      { name: 'Telegram', value: 'telegram' },
      { name: 'VK', value: 'vk' },
    ],
    required: true,
  });
  if (platforms.length === 0) {
    console.log('No platforms selected. Exiting.');
    process.exit(1);
  }

  createProject({
    projectName,
    platforms,
    useLocal: process.argv.includes('--local'),
  });
  console.log('\nDone! Start your bot:\n');
  console.log(`  cd ${projectName}`);
  console.log('  cp .env.example .env    # fill in your tokens');
  console.log('  npm run dev\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(console.error);
}
