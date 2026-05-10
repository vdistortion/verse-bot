import { bold, getUserOwnCommandLogs, UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function myLogCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') return;
  const dbUserId = ctx.dbUserId;
  if (!dbUserId) {
    await ctx.replySafe(phrases.errorDefault(ctx.platform));
    return;
  }

  try {
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
  } catch (err) {
    console.error('Mylog error:', err);
    await ctx.replySafe(phrases.errorDefault(ctx.platform));
  }
}
