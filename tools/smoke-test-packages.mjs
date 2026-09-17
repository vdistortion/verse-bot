import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const packageNames = [
  '@verse-bot/core',
  '@verse-bot/postgres',
  '@verse-bot/tg-core',
  '@verse-bot/vk-core',
];
const workDir = mkdtempSync(join('/tmp/opencode', 'verse-bot-consumer-'));
const tarballDir = join(workDir, 'tarballs');
const consumerDir = join(workDir, 'consumer');

function run(command, args, cwd = root) {
  execFileSync(command, args, { cwd, stdio: 'inherit' });
}

run('npm', ['run', 'build']);
mkdirSync(tarballDir, { recursive: true });

for (const packageName of packageNames) {
  run('npm', ['pack', '--workspace', packageName, '--pack-destination', tarballDir]);
}

run('npm', ['run', 'pack', '--workspace=@verse-bot/miniapp']);
const miniappTarball = readdirSync(resolve(root, 'packages/miniapp')).find(
  (file) => file.startsWith('verse-bot-miniapp-') && file.endsWith('.tgz'),
);
if (!miniappTarball) throw new Error('Mini App tarball was not created');
copyFileSync(resolve(root, 'packages/miniapp', miniappTarball), join(tarballDir, miniappTarball));
rmSync(resolve(root, 'packages/miniapp', miniappTarball));

const tarballs = readdirSync(tarballDir)
  .filter((file) => file.endsWith('.tgz'))
  .map((file) => join(tarballDir, file));

if (tarballs.length !== packageNames.length + 1) {
  throw new Error(`Expected ${packageNames.length + 1} package tarballs, found ${tarballs.length}`);
}

mkdirSync(consumerDir, { recursive: true });

writeFileSync(
  join(consumerDir, 'package.json'),
  JSON.stringify(
    {
      name: 'verse-bot-consumer-smoke-test',
      private: true,
      type: 'module',
    },
    null,
    2,
  ),
);

run(
  'npm',
  [
    'install',
    '--no-package-lock',
    '--ignore-scripts',
    '--save-exact',
    '@types/node@^26.0.0',
    ...tarballs,
  ],
  consumerDir,
);

writeFileSync(
  join(consumerDir, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        strict: true,
        skipLibCheck: true,
        noEmit: true,
        types: ['node'],
      },
      include: ['src/**/*.ts'],
    },
    null,
    2,
  ),
);

mkdirSync(join(consumerDir, 'src'), { recursive: true });
writeFileSync(
  join(consumerDir, 'src/index.ts'),
  `import { catchErrors, type UniversalContext } from '@verse-bot/core';
import { initPool, runMigrations } from '@verse-bot/postgres';
import { createUniversalTelegramBot } from '@verse-bot/tg-core';
import { createUniversalVKBot } from '@verse-bot/vk-core';
import { telegramApi } from '@verse-bot/miniapp';

const command = async (ctx: UniversalContext): Promise<void> => {
  await ctx.reply('smoke test');
};

const guardedCommand = catchErrors(command, {
  errorDefault: () => 'error',
});

createUniversalTelegramBot({
  token: 'telegram-token',
  commands: { start: guardedCommand },
  buttons: [],
});

createUniversalVKBot({
  token: 'vk-token',
  groupId: 1,
  commands: { start: guardedCommand },
  buttons: [],
});

void initPool;
void runMigrations;
void telegramApi;
`,
);

const tsc = join(root, 'node_modules/typescript/bin/tsc');
run(process.execPath, [tsc, '--project', 'tsconfig.json'], consumerDir);

console.log(`Package consumer smoke test passed: ${consumerDir}`);
