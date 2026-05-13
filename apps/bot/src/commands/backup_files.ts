import { existsSync } from 'node:fs';
// @ts-ignore ToDo
import { ZipArchive } from 'archiver';
import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';
import { CONTENT_DIR } from '../env.js';

const contentDir = CONTENT_DIR ?? '/srv/content/imp';

export async function backupFilesCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') return;
  if (!ctx.isAdmin) {
    await ctx.replySafe(phrases.admin.notAdmin(ctx.platform));
    return;
  }
  if (!ctx.replyWithFile) {
    await ctx.replySafe(phrases.backupDb.unsupported(ctx.platform));
    return;
  }

  if (!existsSync(contentDir)) {
    await ctx.replySafe(phrases.backupFiles.notFound(ctx.platform, contentDir));
    return;
  }

  try {
    await ctx.replySafe(phrases.backupFiles.start(ctx.platform));

    const buffer = await zipDirectory(contentDir);
    const filename = `content_backup_${new Date().toISOString()}.zip`;
    await ctx.replyWithFile(buffer, filename, phrases.backupFiles.success(ctx.platform));
  } catch (err) {
    console.error('Backup files error:', err);
    await ctx.replySafe(phrases.backupFiles.error(ctx.platform));
  }
}

function zipDirectory(sourceDir: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = new ZipArchive('zip', { zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    archive.directory(sourceDir, false);
    archive.finalize();
  });
}
