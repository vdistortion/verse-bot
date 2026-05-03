import { getAllUsers, type DbUser, type UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { phrases } from '../locales/ru';
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
    hour12: false,
  });
}

export async function listUsersCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.listUsers.notAdmin : phrases.listUsers.notAdmin,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
    return;
  }

  const isTg = ctx.platform === 'telegram';

  try {
    await ctx.reply(
      isTg ? escapeMarkdownV2(phrases.listUsers.loading) : phrases.listUsers.loading,
      isTg ? { parse_mode: 'MarkdownV2' } : {},
    );
    const users: DbUser[] = await getAllUsers();

    if (users.length === 0) {
      await ctx.reply(
        isTg ? phrases.listUsers.empty : phrases.listUsers.empty,
        isTg ? { parse_mode: 'MarkdownV2' } : {},
      );
      return;
    }

    let message = isTg
      ? `*${escapeMarkdownV2(phrases.listUsers.header(users.length))}*\n\n`
      : `${phrases.listUsers.header(users.length)}\n\n`;

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
        } catch {}
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
        } catch {}
      }

      const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Межзвёздный скиталец ✨';
      const platformId = (user.tg_id ?? user.vk_id)!;
      const registeredAt = formatDate(user.created_at);
      const lastActivity = formatDate(user.updated_at);

      if (isTg) {
        let nameDisplay: string;

        if (user.tg_id) {
          nameDisplay = username
            ? `[${escapeMarkdownV2(fullName)}](https://t.me/${username})`
            : escapeMarkdownV2(fullName);
        } else {
          const profileLink = username
            ? `https://vk.com/${username}`
            : `https://vk.com/id${user.vk_id}`;
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
        } else if (username) {
          profileLink = `https://t.me/${username}`;
        } else {
          profileLink = '';
        }

        const platform = user.tg_id ? 'Telegram' : 'ВКонтакте';

        message +=
          `• ${fullName}${profileLink ? ` ${profileLink}` : ''}\n` +
          `  ${platform} id: ${platformId}\n` +
          `  Зарегистрирован: ${registeredAt}\n` +
          `  Последняя активность: ${lastActivity}\n\n`;
      }
    }

    await ctx.reply(message, {
      parse_mode: 'MarkdownV2',
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.error('List users error:', err);
    await ctx.reply(
      isTg ? phrases.listUsers.error : phrases.listUsers.error,
      isTg ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
