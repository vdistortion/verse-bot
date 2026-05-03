import { getAllUsers, type UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import type { DbUser } from '@scope/shared';
import { tgBot, vkBot } from '../';

function formatDate(dateStr: string): string {
  // Форматируем дату без информации о часовом поясе, чтобы избежать скобок
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export async function listUsersCommand(ctx: UniversalContext): Promise<void> {
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

  const isTg = ctx.platform === 'telegram';

  try {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('⏳ Загружаю список пользователей...')
        : '⏳ Загружаю список пользователей...',
    );

    const users: DbUser[] = await getAllUsers();

    if (users.length === 0) {
      await ctx.reply(
        ctx.platform === 'telegram'
          ? escapeMarkdownV2('В базе данных нет активных пользователей.')
          : 'В базе данных нет активных пользователей.',
      );
      return;
    }

    let message = isTg
      ? `👥 *${escapeMarkdownV2(`Список активных пользователей (${users.length}):`)}*\n\n`
      : `👥 Список активных пользователей (${users.length}):\n\n`;

    for (const user of users) {
      let firstName: string | undefined;
      let lastName: string | undefined;
      let username: string | undefined;

      if (user.tg_id && tgBot) {
        try {
          const tgChat = await tgBot.api.getChat(Number(user.tg_id));
          firstName = tgChat.first_name;
          lastName = tgChat.last_name;
          username = tgChat.username;
        } catch {
          // getChat недоступен — данных нет, продолжаем без них
        }
      } else if (user.vk_id && vkBot) {
        try {
          const result = await vkBot.request('users.get', {
            user_ids: user.vk_id,
            fields: 'first_name,last_name,screen_name',
          });
          if (Array.isArray(result) && result.length > 0) {
            const vkUser = result[0] as {
              first_name?: string;
              last_name?: string;
              screen_name?: string;
            };
            firstName = vkUser.first_name;
            lastName = vkUser.last_name;
            username = vkUser.screen_name;
          }
        } catch {
          // users.get недоступен — данных нет, продолжаем без них
        }
      }

      const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Межзвёздный скиталец ✨';
      const platformId = (user.tg_id ?? user.vk_id)!;
      const registeredAt = formatDate(user.created_at);
      const lastActivity = formatDate(user.updated_at);

      if (isTg) {
        let nameDisplay: string;

        if (user.tg_id) {
          nameDisplay = username
            ? `[${escapeMarkdownV2(fullName)}](https://t.me/${escapeMarkdownV2(username)})`
            : escapeMarkdownV2(fullName);
        } else {
          const profileLink = username
            ? `https://vk\\.com/${escapeMarkdownV2(username)}`
            : `https://vk\\.com/id${escapeMarkdownV2(user.vk_id!)}`;
          nameDisplay = `[${escapeMarkdownV2(fullName)}](${profileLink})`;
        }

        const platform = user.tg_id ? 'Telegram' : 'ВКонтакте';

        message +=
          `• ${nameDisplay}\n` +
          `  ${escapeMarkdownV2(`${platform} id: ${platformId}`)}\n` +
          `  ${escapeMarkdownV2(`Зарегистрирован: ${registeredAt}`)}\n` +
          `  ${escapeMarkdownV2(`Последняя активность: ${lastActivity}`)}\n\n`;
      } else {
        // VK-интерфейс
        let profileLink: string;
        if (user.vk_id) {
          profileLink = username ? `https://vk.com/${username}` : `https://vk.com/id${user.vk_id}`;
        } else {
          profileLink = username ? `https://t.me/${username}` : '';
        }

        const platform = user.tg_id ? 'Telegram' : 'ВКонтакте';

        message +=
          `• ${fullName}${profileLink ? ` ${profileLink}` : ''}\n` +
          `  ${platform} id: ${platformId}\n` +
          `  Зарегистрирован: ${registeredAt}\n` +
          `  Последняя активность: ${lastActivity}\n\n`;
      }
    }

    await ctx.reply(message,
    {
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении списка пользователей:', err);
    await ctx.reply(
      `❌ Произошла ошибка при получении списка пользователей: ${isTg ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
