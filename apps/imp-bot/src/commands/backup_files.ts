import { existsSync } from 'node:fs';
import { ZipArchive } from 'archiver';
import { requireAdmin } from '@verse-bot/shared';
import { phrases } from '../locales/ru.js';
import { CONTENT_DIR } from '../env.js';

const contentDir = CONTENT_DIR ?? '/srv/content/imp';

export const backupFilesCommand = requireAdmin(async (ctx) => {
  if (!ctx.replyWithFile) {
    await ctx.replySafe(phrases.backupDb.unsupported(ctx.platform));
    return;
  }

  if (!existsSync(contentDir)) {
    await ctx.replySafe(phrases.backupFiles.notFound(ctx.platform, contentDir));
    return;
  }

  await ctx.replySafe(phrases.backupFiles.start(ctx.platform));

  const buffer = await zipDirectory(contentDir);
  const filename = `content_backup_${new Date().toISOString()}.zip`;
  await ctx.replyWithFile(buffer, filename, phrases.backupFiles.success(ctx.platform));
}, phrases);

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
