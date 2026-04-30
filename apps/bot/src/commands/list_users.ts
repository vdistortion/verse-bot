import { getAllUsers, type UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export async function listUsersCommand(ctx: UniversalContext): Promise<void> {
  if (!ctx.isAdmin) {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('⛔ У вас нет прав для выполнения этой команды.')
        : '⛔ У вас нет прав для выполнения этой команды.',
    );
    return;
  }

  try {
    const users = await getAllUsers();

    if (users.length === 0) {
      await ctx.reply(
        ctx.platform === 'telegram'
          ? escapeMarkdownV2('В базе данных нет активных пользователей.')
          : 'В базе данных нет активных пользователей.',
      );
      return;
    }

    let message =
      ctx.platform === 'telegram'
        ? `👥 *${escapeMarkdownV2(`Список активных пользователей (${users.length}):`)}*\n\n`
        : `👥 Список активных пользователей (${users.length}):\n\n`;

    for (const user of users) {
      // Форматируем дату без информации о часовом поясе, чтобы избежать скобок
      const formattedDate = new Date(user.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      let userLink = '';
      if (user.platform === 'telegram') {
        userLink = `tg://user?id=${user.platform_user_id}`;
      } else if (user.platform === 'vk') {
        userLink = `https://vk.com/id${user.platform_user_id}`;
      }

      message +=
        ctx.platform === 'telegram'
          ? escapeMarkdownV2(
              `• ${userLink}\n  ID: ${user.platform_user_id}\n  Платформа: ${user.platform}\n  Зарегистрирован: ${formattedDate}\n\n`,
            )
          : `• ${userLink}\n  ID: ${user.platform_user_id}\n  Платформа: ${user.platform}\n  Зарегистрирован: ${formattedDate}\n\n`;
    }

    await ctx.reply(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении списка пользователей:', err);
    await ctx.reply(
      `❌ Произошла ошибка при получении списка пользователей: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
