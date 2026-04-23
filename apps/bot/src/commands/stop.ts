import type { UniversalContext } from '@scope/shared';
import { removeUser } from '@scope/shared';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  await removeUser(ctx.platform, ctx.userId);

  const farewellMessage = '👋 Пока! Если что — /start чтобы вернуться.';
  const messageToSend =
    ctx.platform === 'telegram' ? escapeMarkdownV2(farewellMessage) : farewellMessage;

  await ctx.reply(messageToSend, {
    remove_keyboard: true,
  });
}
