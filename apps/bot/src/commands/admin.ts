import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export async function adminCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('⛔ У вас нет прав для выполнения этой команды.')
        : '⛔ У вас нет прав для выполнения этой команды.',
    );
    return;
  }

  const isTg = ctx.platform === 'telegram';
  const message = isTg
    ? `👑 *Административные команды:*
/backupdb – 💾 Сделать бэкап базы данных
/list\\_users – 👥 Список активных пользователей`
: `👑 Административные команды:
/list_users – 👥 Список активных пользователей`;

  await ctx.reply(message);
}
