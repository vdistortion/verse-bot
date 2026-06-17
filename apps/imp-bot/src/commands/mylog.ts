import { requirePrivateChat, catchErrors, type RichMessage } from '@verse-bot/core';
import { getUserOwnCommandLogs } from '@verse-bot/db';
import { bold } from 'tg-rich-messages';
import { phrases } from '../locales/ru.js';
import { concatRich } from '../rich-utils.js';

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
    const messageParts: RichMessage[] = [ctx.format`${bold('📋 Ваши последние действия')}\n\n`];
    for (const entry of logs) {
      const platform = entry.platform === 'telegram' ? 'TG' : 'VK';
      messageParts.push(ctx.format`• ${entry.command} (${platform})\n`);
    }
    await ctx.replySafe(concatRich(ctx.format, messageParts));
  }, phrases),
);
