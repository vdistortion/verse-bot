import { requirePrivateChat, catchErrors } from '@verse-bot/core';
import { getUserOwnCommandLogs } from '@verse-bot/db';
import { bold } from '@verse-bot/format';
import { phrases } from '../locales/ru.js';

export const myLogCommand = requirePrivateChat(
  catchErrors(async (ctx) => {
    const dbUserId = ctx.dbUserId;
    if (!dbUserId) {
      await ctx.replySafe(phrases.errorDefault(ctx.format));
      return;
    }

    const logs = await getUserOwnCommandLogs(dbUserId, 15);
    if (logs.length === 0) {
      await ctx.replySafe('У вас пока нет логов.');
      return;
    }
    let message = ctx.format`${bold('📋 Ваши последние действия')}\n\n`;
    for (const entry of logs) {
      const platform = entry.platform === 'telegram' ? 'TG' : 'VK';
      message += ctx.format`• ${entry.command} (${platform})\n`;
    }
    await ctx.replySafe(message);
  }, phrases),
);
