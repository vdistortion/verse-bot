import type { UniversalContext } from '@scope/shared';
import { removeUser } from '@scope/shared';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  await removeUser(ctx.platform, ctx.userId);

  const messageToSend = '👋 Пока! Если что — /start чтобы вернуться.';

  await ctx.reply(messageToSend, {
    remove_keyboard: true,
  });
}
