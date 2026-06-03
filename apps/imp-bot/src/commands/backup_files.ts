import { existsSync } from 'node:fs';
import { ZipArchive } from 'archiver';
import { format, requireAdmin } from '@verse-bot/shared';
import { CONTENT_DIR } from '../env.js';

export const backupFilesCommand = requireAdmin(async (ctx) => {
  if (!ctx.replyWithFile) {
    await ctx.replySafe(
      format(ctx.platform)`❌ Отправка файлов бэкапа не поддерживается на этой платформе.`,
    );
    return;
  }

  if (!existsSync(CONTENT_DIR)) {
    await ctx.replySafe(format(ctx.platform)`⚠️ Папка с контентом не найдена: ${CONTENT_DIR}`);
    return;
  }

  await ctx.replySafe(format(ctx.platform)`⏳ Упаковываю файлы...`);

  const buffer = await zipDirectory(CONTENT_DIR);
  const filename = `content_backup_${new Date().toISOString()}.zip`;
  await ctx.replyWithFile(buffer, filename, format(ctx.platform)`📦 Бэкап файлов контента`);
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
