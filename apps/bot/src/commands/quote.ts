import { bold, UniversalContext } from '@scope/shared';
import { getQuote } from '../data-sources';
import { phrases } from '../locales/ru';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  try {
    const { quoteText, quoteAuthor } = await getQuote();
    const text = quoteAuthor
      ? ctx.format`${quoteText}\n\n${bold(quoteAuthor)}`
      : ctx.format`${quoteText}`;
    await ctx.reply(text, ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {});
  } catch (err) {
    console.error('Quote error:', err);
    await ctx.reply(
      phrases.errorDefault,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
