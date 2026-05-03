import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function backupDbCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.reply(
      phrases.backupDb.notAdmin,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
    return;
  }

  if (!ctx.replyWithFile) {
    await ctx.reply(
      phrases.backupDb.unsupported,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
    return;
  }

  if (!ctx.db) {
    await ctx.reply(
      phrases.content.dbUnavailable,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
    return;
  }

  try {
    await ctx.reply(
      phrases.backupDb.start,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
    const backupData: Record<string, any[]> = {};
    const tablesToBackup = ['bot_content', 'users'];

    for (const tableName of tablesToBackup) {
      const { data, error } = await ctx.db.from(tableName).select('*');
      if (error) throw error;
      backupData[tableName] = data || [];
    }

    const filename = `full_db_backup_${new Date().toISOString()}.json`;
    const buffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    await ctx.replyWithFile(buffer, filename, phrases.backupDb.success);
  } catch (err) {
    console.error('Backup error:', err);
    await ctx.reply(
      phrases.backupDb.error,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
