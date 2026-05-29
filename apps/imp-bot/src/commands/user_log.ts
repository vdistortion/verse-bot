import { getUserCommandLogs, bold, requireAdmin, catchErrors } from '@verse/shared';
import { phrases } from '../locales/ru';

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
  phrases,
);
