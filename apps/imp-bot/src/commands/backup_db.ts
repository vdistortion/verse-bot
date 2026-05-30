import { execSync } from 'node:child_process';
import { escapeMarkdownV2, requireAdmin } from '@verse-bot/shared';
import { phrases } from '../locales/ru.js';

export const backupDbCommand = requireAdmin(async (ctx) => {
  if (!ctx.replyWithFile) {
    await ctx.replySafe(phrases.backupDb.unsupported(ctx.platform));
    return;
  }

  const dbUser = process.env.POSTGRES_USER;
  const dbPass = process.env.POSTGRES_PASSWORD;
  const dbHost = process.env.POSTGRES_HOST;
  const dbName = process.env.POSTGRES_DB;

  if (!dbUser || !dbPass || !dbHost || !dbName) {
    await ctx.replySafe('Не заданы параметры подключения к БД.');
    return;
  }

  await ctx.replySafe(phrases.backupDb.start(ctx.platform));

  try {
    const dump = execSync(
      `pg_dump -U ${dbUser} -h ${dbHost} -d ${dbName} --no-owner --no-privileges`,
      {
        env: { ...process.env, PGPASSWORD: dbPass },
        maxBuffer: 50 * 1024 * 1024, // 50 MB
      },
    );

    const filename = `full_db_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    await ctx.replyWithFile(
      dump,
      filename,
      escapeMarkdownV2(phrases.backupDb.success(ctx.platform)),
    );
  } catch (pgDumpErr) {
    console.error('[backupDb] pg_dump error:', pgDumpErr);

    // Fallback: JSON-дамп
    if (ctx.db) {
      const backupData: Record<string, any[]> = {};
      const tablesToBackup = ['bot_content', 'users', 'command_logs'];

      for (const tableName of tablesToBackup) {
        try {
          const { rows } = await ctx.db.query(`SELECT * FROM ${tableName}`);
          backupData[tableName] = rows;
        } catch (tableErr: any) {
          console.warn(`[backupDb] Skipping table ${tableName}: ${tableErr.message}`);
        }
      }

      if (Object.keys(backupData).length === 0) {
        await ctx.replySafe('Нет доступных таблиц для бэкапа (возможно, БД пуста).');
        return;
      }

      const jsonBuffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');
      const jsonFilename = `db_backup_${Date.now()}.json`;
      await ctx.replyWithFile(
        jsonBuffer,
        jsonFilename,
        escapeMarkdownV2('pg_dump недоступен, вот JSON-бэкап'),
      );
      return;
    }

    await ctx.replySafe(phrases.backupDb.error(ctx.platform));
  }
}, phrases);
