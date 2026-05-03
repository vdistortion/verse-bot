import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function backupDbCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.replySafe(phrases.backupDb.notAdmin);
    return;
  }

  if (!ctx.replyWithFile) {
    await ctx.replySafe(phrases.backupDb.unsupported);
    return;
  }

  if (!ctx.db) {
    await ctx.replySafe(phrases.content.dbUnavailable);
    return;
  }

  try {
    await ctx.replySafe(phrases.backupDb.start);
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
    await ctx.replySafe(phrases.backupDb.error);
  }
}
