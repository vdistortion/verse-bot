import type { UniversalContext, UniversalReplyOptions } from '@verse-bot/shared';
import { getButtons, phrases } from '../locales/ru.js';

export async function startCommand(ctx: UniversalContext) {
  const buttons = getButtons(false);
  // группируем в ряды по 2 кнопки
  const universalKeyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    universalKeyboard.push(
      buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })),
    );
  }
  const message = phrases.start.mainMenu(ctx.platform);

  const extra: UniversalReplyOptions = {};

  if (ctx.chatType === 'private') {
    extra.replyKeyboard = universalKeyboard;
  } else {
    extra.inlineKeyboard = universalKeyboard;
  }

  await ctx.replySafe(message, extra);
}
