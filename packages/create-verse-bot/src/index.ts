#!/usr/bin/env node
import { input, checkbox } from '@inquirer/prompts';
import path from 'node:path';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  const useLocal = process.argv.includes('--local');
  const targetDir = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(targetDir)) {
    console.error(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  // Копируем шаблон
  const templateDir = path.resolve(__dirname, '../template');
  fs.copySync(templateDir, targetDir);

  // Обновляем package.json для зависимостей
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = fs.readJsonSync(pkgPath);
  const deps: Record<string, string> = {};

  // Определяем способ подключения пакетов
  const resolvePackage = (name: string) =>
    useLocal ? `file:${path.resolve(__dirname, '../..', name.split('/')[1])}` : 'latest';

  deps['@verse-bot/shared'] = resolvePackage('@verse-bot/shared');
  if (platforms.includes('telegram')) {
    deps['@verse-bot/tg-core'] = resolvePackage('@verse-bot/tg-core');
  }
  if (platforms.includes('vk')) {
    deps['@verse-bot/vk-core'] = resolvePackage('@verse-bot/vk-core');
  }

  pkg.dependencies = { ...pkg.dependencies, ...deps };
  // Удаляем лишние зависимости, если платформа не выбрана
  if (!platforms.includes('telegram')) {
    delete pkg.dependencies['@verse-bot/tg-core'];
  }
  if (!platforms.includes('vk')) {
    delete pkg.dependencies['@verse-bot/vk-core'];
  }
  fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });

  console.log(`Project "${projectName}" created. Installing dependencies...`);
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  console.log('\nDone! Start your bot:\n');
  console.log(`  cd ${projectName}`);
  console.log('  cp .env.example .env    # fill in your tokens');
  console.log('  npm run dev\n');
}

main().catch(console.error);
