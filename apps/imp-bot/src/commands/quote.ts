import { bold, catchErrors } from '@verse-bot/shared';
import { getQuote } from '../data-sources';
import { phrases } from '../locales/ru';

export const quoteCommand = catchErrors(async (ctx) => {
  const { quoteText, quoteAuthor } = await getQuote();
  const text = quoteAuthor
    ? ctx.format`${quoteText}\n\n${bold(quoteAuthor)}`
    : ctx.format`${quoteText}`;
  await ctx.replySafe(text);
}, phrases);
