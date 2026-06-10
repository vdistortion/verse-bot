import { existsSync } from 'node:fs';
import { ZipArchive } from 'archiver';
import { requireAdmin } from '@verse-bot/core';
import { CONTENT_DIR } from '../env.js';

export const backupFilesCommand = requireAdmin(async (ctx) => {
  if (!ctx.replyWithFile) {
    await ctx.replySafe(ctx.format`❌ Отправка файлов бэкапа не поддерживается на этой платформе.`);
    return;
  }

  if (!existsSync(CONTENT_DIR)) {
    await ctx.replySafe(ctx.format`⚠️ Папка с контентом не найдена: ${CONTENT_DIR}`);
    return;
  }

  await ctx.replySafe(ctx.format`⏳ Упаковываю файлы...`);

  const buffer = await zipDirectory(CONTENT_DIR);
  const filename = `content_backup_${new Date().toISOString()}.zip`;
  await ctx.replyWithFile(buffer, filename, ctx.format`📦 Бэкап файлов контента`);
});

function zipDirectory(sourceDir: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive({ zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk) => chunks.push(chunk));
    archive.on('end', () => {
      archive.removeAllListeners('error');
      resolve(Buffer.concat(chunks));
    });
    archive.on('error', reject);

    archive.directory(sourceDir, false);
    archive.finalize().catch(reject);
  });
}
