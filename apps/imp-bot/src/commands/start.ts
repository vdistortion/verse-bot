import type { UniversalContext } from '@verse-bot/core';
import { getButtons, phrases } from '../locales/ru.js';

export async function startCommand(ctx: UniversalContext) {
  const profile = await ctx.getUserProfile();
  const buttons = getButtons(false);
  // группируем в ряды по 2 кнопки
  const universalKeyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    universalKeyboard.push(
      buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })),
    );
  }

  if (ctx.chatType === 'private') {
    await ctx.replySafe(phrases.start.personal(ctx.format, profile?.firstName ?? 'гость'), {
      replyKeyboard: universalKeyboard,
    });
  } else {
    await ctx.replySafe(phrases.start.group(ctx.format, ctx.chatTitle ?? 'группа'), {
      inlineKeyboard: universalKeyboard,
    });
  }
}
