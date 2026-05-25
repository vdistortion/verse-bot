import { createVKKeyboard, type UniversalContext } from '@scope/shared';
import { createTelegramKeyboard } from '@scope/tg-bot-core';
import { getButtons, phrases } from '../locales/ru';

export async function startCommand(
  ctx: UniversalContext,
  fullMenu: boolean = false,
): Promise<void> {
  const buttons = getButtons(fullMenu);
  // группируем в ряды по 2 кнопки
  const universalKeyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    universalKeyboard.push(
      buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })),
    );
  }
  const message = fullMenu
    ? phrases.start.fullMenu(ctx.platform)
    : phrases.start.mainMenu(ctx.platform);

  await ctx.replySafe(message, {
    ...(ctx.platform === 'telegram'
      ? { telegramReplyMarkup: createTelegramKeyboard(universalKeyboard) }
      : { vkKeyboard: createVKKeyboard(universalKeyboard) }),
  });
}
