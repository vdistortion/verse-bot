import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function backupDbCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.replySafe(phrases.backupDb.notAdmin(ctx.platform));
    return;
  }

  if (!ctx.replyWithFile) {
    await ctx.replySafe(phrases.backupDb.unsupported(ctx.platform));
    return;
  }

  if (!ctx.db) {
    await ctx.replySafe(phrases.content.dbUnavailable(ctx.platform));
    return;
  }

  try {
    await ctx.replySafe(phrases.backupDb.start(ctx.platform));
    const backupData: Record<string, any[]> = {};
    const tablesToBackup = ['bot_content', 'users', 'command_logs'];

    for (const tableName of tablesToBackup) {
      const { rows } = await ctx.db.query(`SELECT * FROM ${tableName}`);
      backupData[tableName] = rows;
    }

    const filename = `full_db_backup_${new Date().toISOString()}.json`;
    const buffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
    await ctx.replyWithFile(buffer, filename, phrases.backupDb.success(ctx.platform));
  } catch (err) {
    console.error('Backup error:', err);
    await ctx.replySafe(phrases.backupDb.error(ctx.platform));
  }
}
