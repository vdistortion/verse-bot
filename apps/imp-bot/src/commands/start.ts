import { createVKKeyboard, type UniversalContext } from '@verse-bot/shared';
import { createTelegramKeyboard } from '@verse-bot/tg-core';
import { getButtons, phrases } from '../locales/ru.js';

export async function startCommand(ctx: UniversalContext) {
  const buttons = getButtons();
  // группируем в ряды по 2 кнопки
  const universalKeyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    universalKeyboard.push(
      buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })),
    );
  }
  const message = phrases.start.mainMenu(ctx.platform);

  await ctx.replySafe(message, {
    ...(ctx.platform === 'telegram'
      ? { telegramReplyMarkup: createTelegramKeyboard(universalKeyboard) }
      : { vkKeyboard: createVKKeyboard(universalKeyboard) }),
  });
}
