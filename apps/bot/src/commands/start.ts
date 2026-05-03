import { createUniversalKeyboard, createVKKeyboard, type UniversalContext } from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
): Promise<void> {
  const isPrivate = ctx.chatType === 'private';
  const universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu, ctx.isAdmin, isPrivate);
  const message =
    ctx.platform === 'telegram'
      ? fullMenu
        ? '🌟 *Расширенное меню*'
        : '🐾 *Главное меню*'
      : fullMenu
        ? '🌟 Расширенное меню'
        : '🐾 Главное меню';

  const replyOptions =
    ctx.platform === 'telegram'
      ? { telegramReplyMarkup: createTelegramKeyboard(universalKeyboard) }
      : { vkKeyboard: createVKKeyboard(universalKeyboard) };

  await ctx.reply(message, replyOptions);
}
