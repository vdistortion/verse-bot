import { createUniversalKeyboard, createVKKeyboard, type UniversalContext } from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';
import { phrases } from '../locales/ru';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
): Promise<void> {
  const isPrivate = ctx.chatType === 'private';
  const universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu, ctx.isAdmin, isPrivate);
  const message = fullMenu
    ? phrases.start.fullMenu(ctx.platform)
    : phrases.start.mainMenu(ctx.platform);

  const replyOptions =
    ctx.platform === 'telegram'
      ? {
          parse_mode: 'MarkdownV2' as const,
          telegramReplyMarkup: createTelegramKeyboard(universalKeyboard),
        }
      : { vkKeyboard: createVKKeyboard(universalKeyboard) };

  await ctx.reply(message, replyOptions);
}
