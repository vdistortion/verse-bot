import {
  addUser,
  createUniversalKeyboard,
  createVKKeyboard,
  createUniversalSettingsKeyboard,
  type UniversalContext,
  type UniversalReplyOptions,
} from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
  isSettingsMenu: boolean = false,
): Promise<void> {
  await addUser(ctx.platform, ctx.userId);

  let universalKeyboard;
  let message: string;

  if (isSettingsMenu) {
    universalKeyboard = createUniversalSettingsKeyboard(ctx.platform, ctx.isAdmin);
    message = ctx.platform === 'telegram' ? '⚙️ *Меню настроек*\\:' : '⚙️ Меню настроек:';
  } else {
    universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu);
    message =
      ctx.platform === 'telegram'
        ? fullMenu
          ? '🌟 *Расширенное меню*'
          : '🐾 *Главное меню*'
        : fullMenu
          ? '🌟 Расширенное меню'
          : '🐾 Главное меню';
  }

  const replyOptions: UniversalReplyOptions = {};

  if (ctx.platform === 'telegram') {
    replyOptions.telegramReplyMarkup = createTelegramKeyboard(universalKeyboard);
  } else if (ctx.platform === 'vk') {
    replyOptions.vkKeyboard = createVKKeyboard(universalKeyboard);
  }

  await ctx.reply(message, replyOptions);
}
