import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export async function backupDbCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('⛔ У вас нет прав для выполнения этой команды.')
        : '⛔ У вас нет прав для выполнения этой команды.',
    );
    return;
  }

  if (!ctx.replyWithFile) {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('❌ Отправка файлов бэкапа не поддерживается на этой платформе.')
        : '❌ Отправка файлов бэкапа не поддерживается на этой платформе.',
    );
    return;
  }

  if (!ctx.db) {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('❌ База данных недоступна.')
        : '❌ База данных недоступна.',
    );
    return;
  }

  try {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('⏳ Запускаю создание бэкапа всех таблиц...')
        : '⏳ Запускаю создание бэкапа всех таблиц...',
    );

    const backupData: Record<string, any[]> = {};
    const tablesToBackup = ['bot_content', 'users'];

    for (const tableName of tablesToBackup) {
      const { data, error } = await ctx.db.from(tableName).select('*');
      if (error) {
        console.error(`Ошибка при получении данных из таблицы ${tableName}:`, error);
        throw new Error(
          ctx.platform === 'telegram'
            ? escapeMarkdownV2(
                `Не удалось получить данные из таблицы \`${tableName}\`: ${error.message}`,
              )
            : `Не удалось получить данные из таблицы ${tableName}: ${error.message}`,
        );
      }
      backupData[tableName] = data || [];
    }

    const filename = `full_db_backup_${new Date().toISOString()}.json`;
    const buffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');

    // Здесь мы уверены, что ctx.replyWithFile существует
    await ctx.replyWithFile(
      buffer,
      filename,
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('Вот ваш полный бэкап базы данных 💾')
        : 'Вот ваш полный бэкап базы данных 💾',
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при создании полного бэкапа базы данных:', err);
    await ctx.reply(
      `❌ Произошла ошибка при создании полного бэкапа базы данных: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
