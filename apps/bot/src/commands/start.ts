import type { UniversalContext, UniversalReplyOptions } from '@scope/shared';
import { createUniversalKeyboard, createVKKeyboard } from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
): Promise<void> {
  const universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu);
  const replyOptions: UniversalReplyOptions = {};

  if (ctx.platform === 'telegram') {
    replyOptions.telegramReplyMarkup = createTelegramKeyboard(universalKeyboard);
  } else if (ctx.platform === 'vk') {
    replyOptions.vkKeyboard = createVKKeyboard(universalKeyboard);
  }

  await ctx.reply(`👋 Привет! Я работаю на платформе: ${ctx.platform}`, replyOptions);
}
