import { requireAdmin, catchErrors, type UserProfile } from '@verse-bot/core';
import { getAllUsers, type DbUser } from '@verse-bot/db';
import { link, bold } from '@verse-bot/format';
import { phrases } from '../locales/ru.js';

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

export const listUsersCommand = requireAdmin(
  catchErrors(async (ctx) => {
    await ctx.replySafe(ctx.format`Загружаю список пользователей...`);

    const users: DbUser[] = await getAllUsers();

    if (users.length === 0) {
      await ctx.replySafe(ctx.format`В базе данных нет активных пользователей.`);
      return;
    }

    let message = ctx.format`${bold(`👥 Список активных пользователей (${users.length}):`)}\n\n`;

    for (const user of users) {
      let profile: UserProfile | null = null;
      if (user.tg_id && ctx.platform === 'telegram' && ctx.platformApi) {
        const api = ctx.platformApi as import('grammy').Api;
        try {
          const tgChat = await api.getChat(Number(user.tg_id));
          profile = {
            firstName: tgChat.first_name ?? 'Unknown',
            lastName: tgChat.last_name,
            username: tgChat.username,
          };
        } catch {}
      } else if (user.vk_id && ctx.platform === 'vk' && ctx.platformApi) {
        const api = ctx.platformApi as import('@verse-bot/vk-core').VKBot;
        try {
          const result = (await api.request('users.get', {
            user_ids: user.vk_id,
            fields: 'first_name,last_name,screen_name',
          })) as any[];
          if (result.length > 0) {
            const vkUser = result[0];
            profile = {
              firstName: vkUser.first_name,
              lastName: vkUser.last_name,
              username: vkUser.screen_name,
            };
          }
        } catch {}
      }

      if (!profile) {
        profile = { firstName: 'Unknown' };
      }

      const fullName =
        [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
        'Межзвёздный скиталец ✨';
      const platformId = (user.tg_id ?? user.vk_id)!;
      const registeredAt = formatDate(user.created_at);
      const lastActivity = formatDate(user.updated_at);
      const platform = user.tg_id ? 'Telegram' : 'ВКонтакте';

      let profileUrl: string | null = null;
      if (user.tg_id && profile.username) {
        profileUrl = `https://t.me/${profile.username}`;
      } else if (user.vk_id) {
        profileUrl = profile.username
          ? `https://vk.com/${profile.username}`
          : `https://vk.com/id${user.vk_id}`;
      }

      const isTg = ctx.platform === 'telegram';
      const namePart = profileUrl ? link(fullName, profileUrl) : isTg ? bold(fullName) : fullName;
      message += ctx.format`• ${namePart}\n  ${platform} id: ${platformId}\n  Зарегистрирован: ${registeredAt}\n  Последняя активность: ${lastActivity}\n  /userlog_${String(user.id)}\n\n`;
    }

    await ctx.replySafe(message, { link_preview_options: { is_disabled: true } });
  }, phrases),
);
