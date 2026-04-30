import { removeUser, type UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  await removeUser(ctx.platform, ctx.userId);

  const messageToSend =
    ctx.platform === 'telegram'
      ? escapeMarkdownV2('👋 Пока! Если что — /start чтобы вернуться.')
      : '👋 Пока! Если что — /start чтобы вернуться.';

  await ctx.reply(messageToSend, {
    remove_keyboard: true,
  });
}
