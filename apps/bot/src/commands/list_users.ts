import { getAllUsers, type DbUser, type UniversalContext, link, bold } from '@scope/shared';
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
    await ctx.replySafe(phrases.listUsers.notAdmin);
    return;
  }

  const isTg = ctx.platform === 'telegram';

  try {
    await ctx.replySafe(phrases.listUsers.loading);

    const users: DbUser[] = await getAllUsers();

    if (users.length === 0) {
      await ctx.replySafe(phrases.listUsers.empty);
      return;
    }

    let message = phrases.listUsers.header(ctx.platform, users.length) + '\n\n';

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
      const platform = user.tg_id ? 'Telegram' : 'ВКонтакте';

      let profileUrl: string | null = null;
      if (user.tg_id && username) {
        profileUrl = `https://t.me/${username}`;
      } else if (user.vk_id) {
        profileUrl = username ? `https://vk.com/${username}` : `https://vk.com/id${user.vk_id}`;
      }

      const namePart = profileUrl ? link(fullName, profileUrl) : isTg ? bold(fullName) : fullName;
      message += ctx.format`• ${namePart}\n  ${platform} id: ${platformId}\n  Зарегистрирован: ${registeredAt}\n  Последняя активность: ${lastActivity}\n\n`;
    }

    await ctx.replySafe(message, { link_preview_options: { is_disabled: true } });
  } catch (err) {
    console.error('List users error:', err);
    await ctx.replySafe(phrases.listUsers.error);
  }
}
