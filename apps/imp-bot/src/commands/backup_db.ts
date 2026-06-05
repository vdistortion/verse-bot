import { execSync } from 'node:child_process';
import { requireAdmin } from '@verse-bot/core';
import { escapeMarkdownV2, format } from '@verse-bot/format';
import { POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_USER } from '../env.js';

export const backupDbCommand = requireAdmin(async (ctx) => {
  if (!ctx.replyWithFile) {
    await ctx.replySafe(
      format(ctx.platform)`❌ Отправка файлов бэкапа не поддерживается на этой платформе.`,
    );
    return;
  }

  await ctx.replySafe(format(ctx.platform)`⏳ Запускаю создание бэкапа...`);

  try {
    const dump = execSync(
      `pg_dump -U ${POSTGRES_USER} -h ${POSTGRES_HOST} -d ${POSTGRES_DB} --no-owner --no-privileges`,
      {
        env: { ...process.env, PGPASSWORD: POSTGRES_PASSWORD },
        maxBuffer: 50 * 1024 * 1024, // 50 MB
      },
    );

    const filename = `full_db_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
    await ctx.replyWithFile(
      dump,
      filename,
      escapeMarkdownV2(format(ctx.platform)`Вот ваш полный бэкап базы данных 💾`),
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

    await ctx.replySafe(format(ctx.platform)`❌ Произошла ошибка при создании бэкапа.`);
  }
});
