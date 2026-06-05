import type { UniversalContext, UniversalReplyOptions } from '@verse-bot/core';
import { getButtons, phrases } from '../locales/ru.js';

export async function startCommand(ctx: UniversalContext) {
  const profile = await ctx.getUserProfile();
  const firstName = profile?.firstName ?? 'гость';

  const buttons = getButtons(false);
  // группируем в ряды по 2 кнопки
  const universalKeyboard = [];
  for (let i = 0; i < buttons.length; i += 2) {
    universalKeyboard.push(
      buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })),
    );
  }

  const extra: UniversalReplyOptions = {};
  let message = '';

  if (ctx.chatType === 'private') {
    message = phrases.start.personal(ctx.platform, firstName);
    extra.replyKeyboard = universalKeyboard;
  } else {
    message = phrases.start.group(ctx.platform, ctx.chatTitle ?? 'группа');
    extra.inlineKeyboard = universalKeyboard;
  }

  await ctx.replySafe(message, extra);
}
