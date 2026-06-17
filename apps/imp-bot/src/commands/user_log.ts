import { requireAdmin, catchErrors, type RichMessage } from '@verse-bot/core';
import { getUserCommandLogs } from '@verse-bot/db';
import { bold } from 'tg-rich-messages';
import { phrases } from '../locales/ru.js';
import { concatRich } from '../rich-utils.js';

export const userLogCommand = requireAdmin(
  catchErrors(async (ctx, userId: number) => {
    const logs = await getUserCommandLogs(userId, 15);
    if (logs.length === 0) {
      await ctx.replySafe(`Нет логов для пользователя ${userId}`);
      return;
    }

    const messageParts: RichMessage[] = [ctx.format`${bold(`📋 Логи пользователя ${userId}`)}\n\n`];
    for (const entry of logs) {
      const time = `ID: ${entry.id}`;
      const platform = entry.platform === 'telegram' ? 'TG' : 'VK';
      messageParts.push(ctx.format`• ${entry.command} (${platform}) — ${time}\n`);
    }
    await ctx.replySafe(concatRich(ctx.format, messageParts));
  }, phrases),
);
