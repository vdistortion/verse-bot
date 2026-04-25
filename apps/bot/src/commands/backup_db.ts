import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function backupDbCommand(ctx: UniversalContext): Promise<void> {
  if (!ctx.isAdmin) {
    await ctx.reply('⛔ У вас нет прав для выполнения этой команды\\.');
    return;
  }

  // Если replyWithFile не поддерживается (например, VK), сообщаем об этом
  if (!ctx.replyWithFile) {
    await ctx.reply('❌ Отправка файлов бэкапа не поддерживается на этой платформе\\.');
    return;
  }

  if (!ctx.db) {
    await ctx.reply('❌ База данных недоступна\\.');
    return;
  }

  try {
    await ctx.reply('⏳ Запускаю создание бэкапа всех таблиц\\.\\.\\.');

    const backupData: Record<string, any[]> = {};
    const tablesToBackup = ['bot_content', 'users']; // Список таблиц для бэкапа

    for (const tableName of tablesToBackup) {
      const { data, error } = await ctx.db.from(tableName).select('*');
      if (error) {
        console.error(`Ошибка при получении данных из таблицы ${tableName}:`, error);
        throw new Error(`Не удалось получить данные из таблицы \`${tableName}\`: ${error.message}`);
      }
      backupData[tableName] = data || []; // Сохраняем данные (или пустой массив, если данных нет)
    }

    const filename = `full_db_backup_${new Date().toISOString()}\\.json`;
    const buffer = Buffer.from(JSON.stringify(backupData, null, 2), 'utf-8');

    // Здесь мы уверены, что ctx.replyWithFile существует
    await ctx.replyWithFile(buffer, filename, 'Вот ваш полный бэкап базы данных 💾');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при создании полного бэкапа базы данных:', err); // Логируем ошибку для отладки
    await ctx.reply(
      `❌ Произошла ошибка при создании полного бэкапа базы данных: ${escapeMarkdownV2(msg)}`,
    );
  }
}
