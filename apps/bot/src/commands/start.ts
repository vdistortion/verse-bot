import { createUniversalKeyboard, createVKKeyboard, type UniversalContext } from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';
import { phrases } from '../locales/ru';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
): Promise<void> {
  const isPrivate = ctx.chatType === 'private';
  const universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu, ctx.isAdmin, isPrivate);
  const message =
    ctx.platform === 'telegram'
      ? fullMenu
        ? phrases.start.fullMenuTg
        : phrases.start.mainMenuTg
      : fullMenu
        ? phrases.start.fullMenu
        : phrases.start.mainMenu;

  const replyOptions =
    ctx.platform === 'telegram'
      ? {
          parse_mode: 'MarkdownV2' as const,
          telegramReplyMarkup: createTelegramKeyboard(universalKeyboard),
        }
      : { vkKeyboard: createVKKeyboard(universalKeyboard) };

  await ctx.reply(message, replyOptions);
}
