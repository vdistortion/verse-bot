import { bold, catchErrors } from '@verse-bot/shared';
import { getQuote } from '../data-sources/index.js';
import { phrases } from '../locales/ru.js';

export const quoteCommand = catchErrors(async (ctx) => {
  const { quoteText, quoteAuthor } = await getQuote();
  const text = quoteAuthor
    ? ctx.format`${quoteText}\n\n${bold(quoteAuthor)}`
    : ctx.format`${quoteText}`;
  await ctx.replySafe(text);
}, phrases);
