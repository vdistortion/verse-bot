import { requireAdmin, catchErrors } from '@verse-bot/core';
import { getUserCommandLogs } from '@verse-bot/db';
import { bold } from '@verse-bot/format';
import { phrases } from '../locales/ru.js';

export const userLogCommand = requireAdmin(
  catchErrors(async (ctx, userId: number) => {
    const logs = await getUserCommandLogs(userId, 15);
    if (logs.length === 0) {
      await ctx.replySafe(`Нет логов для пользователя ${userId}`);
      return;
    }

    let message = ctx.format`${bold(`📋 Логи пользователя ${userId}`)}\n\n`;
    for (const entry of logs) {
      const time = `ID: ${entry.id}`;
      const platform = entry.platform === 'telegram' ? 'TG' : 'VK';
      message += ctx.format`• ${entry.command} (${platform}) — ${time}\n`;
    }

    await ctx.replySafe(message);
  }, phrases),
);
