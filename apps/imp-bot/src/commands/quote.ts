import { bold, catchErrors, type UniversalReplyOptions } from '@verse-bot/shared';
import { getQuote } from '../data-sources/index.js';
import { getInlineButton, phrases } from '../locales/ru.js';

export const quoteCommand = catchErrors(async (ctx) => {
  const { quoteText, quoteAuthor } = await getQuote();
  const text = quoteAuthor
    ? ctx.format`${quoteText}\n\n${bold(quoteAuthor)}`
    : ctx.format`${quoteText}`;

  const extra: UniversalReplyOptions = {};

  if (ctx.chatType !== 'private') {
    extra.inlineKeyboard = getInlineButton('quote', '👇 Продолжить');
  }

  await ctx.replySafe(text, extra);
}, phrases);
