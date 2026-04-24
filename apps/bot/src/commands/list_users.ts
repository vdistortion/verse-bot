import type { UniversalContext } from '@scope/shared';
import { getAllUsers } from '@scope/shared';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function listUsersCommand(ctx: UniversalContext): Promise<void> {
  if (!ctx.isAdmin) {
    await ctx.reply('⛔ У вас нет прав для выполнения этой команды.');
    return;
  }

  try {
    const users = await getAllUsers();

    if (users.length === 0) {
      await ctx.reply('В базе данных нет активных пользователей.');
      return;
    }

    let message = `👥 *Список активных пользователей (${users.length})*:
`;

    users.forEach((user) => {
      // Форматируем дату без информации о часовом поясе, чтобы избежать скобок
      const formattedDate = new Date(user.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false, // Используем 24-часовой формат
      });
      message += `
- ID: \`${String(user.platform_user_id)}\`
  Платформа: \`${user.platform}\`
  Зарегистрирован: \`${formattedDate}\`
`;
    });

    await ctx.reply(escapeMarkdownV2(message));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении списка пользователей:', err);
    await ctx.reply(
      `❌ Произошла ошибка при получении списка пользователей: ${escapeMarkdownV2(msg)}`,
    );
  }
}
