import type { UniversalContext, UniversalReplyOptions } from '@scope/shared';
import {
  addUser,
  createUniversalKeyboard,
  createVKKeyboard,
  createUniversalSettingsKeyboard,
} from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
  isSettingsMenu: boolean = false,
): Promise<void> {
  await addUser(ctx.platform, ctx.userId); // Добавляем/обновляем пользователя

  let universalKeyboard;
  let message = `👋 Привет! Я работаю на платформе: ${ctx.platform}`;

  if (isSettingsMenu) {
    universalKeyboard = createUniversalSettingsKeyboard(ctx.platform, ctx.isAdmin);
    message = '⚙️ Меню настроек:';
  } else {
    universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu);
  }

  const replyOptions: UniversalReplyOptions = {};

  if (ctx.platform === 'telegram') {
    replyOptions.telegramReplyMarkup = createTelegramKeyboard(universalKeyboard);
  } else if (ctx.platform === 'vk') {
    replyOptions.vkKeyboard = createVKKeyboard(universalKeyboard);
  }

  await ctx.reply(escapeMarkdownV2(message), replyOptions);
}
