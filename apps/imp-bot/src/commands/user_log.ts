import { type UniversalContext, getUserCommandLogs, bold } from '@verse/shared';
import { phrases } from '../locales/ru';

export async function userLogCommand(ctx: UniversalContext, userId: number): Promise<void> {
  if (ctx.chatType !== 'private') return;
  if (!ctx.isAdmin) {
    await ctx.replySafe(phrases.admin.notAdmin(ctx.platform));
    return;
  }

  try {
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
  } catch (err) {
    console.error('User log error:', err);
    await ctx.replySafe(phrases.errorDefault(ctx.platform));
  }
}
