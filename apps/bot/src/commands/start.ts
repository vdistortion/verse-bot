import type { UniversalContext, UniversalReplyOptions } from '@scope/shared';
import { addUser, createUniversalKeyboard, createVKKeyboard } from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
): Promise<void> {
  await addUser(ctx.platform, ctx.userId); // Добавляем/обновляем пользователя

  const universalKeyboard = createUniversalKeyboard(ctx.platform, fullMenu);
  const replyOptions: UniversalReplyOptions = {};

  if (ctx.platform === 'telegram') {
    replyOptions.telegramReplyMarkup = createTelegramKeyboard(universalKeyboard);
  } else if (ctx.platform === 'vk') {
    replyOptions.vkKeyboard = createVKKeyboard(universalKeyboard);
  }

  const greetingText = `👋 Привет! Я работаю на платформе: ${ctx.platform}`;
  const messageToSend = ctx.platform === 'telegram' ? escapeMarkdownV2(greetingText) : greetingText;
  await ctx.reply(messageToSend, replyOptions);
}
