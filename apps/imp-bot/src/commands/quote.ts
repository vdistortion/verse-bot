import { catchErrors, type UniversalReplyOptions } from '@verse-bot/core';
import { getInlineButton, phrases } from '../locales/ru.js';
import { formatFor } from '../format.js';

export const quoteCommand = catchErrors(async (ctx) => {
  const text = formatFor(ctx.platform)`Даже цитаты сегодня молчат. Попробуй позже.`;
  const extra: UniversalReplyOptions = {};

  if (ctx.chatType !== 'private') {
    extra.inlineKeyboard = getInlineButton('quote', '👇 Продолжить');
  }

  await ctx.replySafe(text, extra);
}, phrases);
