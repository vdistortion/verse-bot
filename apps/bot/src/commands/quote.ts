import { bold, type UniversalContext } from '@scope/shared';
import { getQuote } from '../data-sources';
import { phrases } from '../locales/ru';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  try {
    const { quoteText, quoteAuthor } = await getQuote();
    const text = quoteAuthor
      ? ctx.format`${quoteText}\n\n${bold(quoteAuthor)}`
      : ctx.format`${quoteText}`;
    await ctx.replySafe(text);
  } catch (err) {
    console.error('Quote error:', err);
    await ctx.replySafe(phrases.errorDefault(ctx.platform));
  }
}
