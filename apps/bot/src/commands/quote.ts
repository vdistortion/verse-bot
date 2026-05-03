import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { getQuote } from '../data-sources';
import { phrases } from '../locales/ru';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  try {
    const { quoteText, quoteAuthor } = await getQuote();
    const textTg = quoteAuthor
      ? `${escapeMarkdownV2(quoteText)}\n\n*${escapeMarkdownV2(quoteAuthor)}*`
      : escapeMarkdownV2(quoteText);
    const textVk = quoteAuthor ? `${quoteText}\n\n${quoteAuthor}` : quoteText;
    const text = ctx.platform === 'telegram' ? textTg : textVk;
    await ctx.reply(text, ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {});
  } catch (err) {
    console.error('Quote error:', err);
    await ctx.reply(
      phrases.errorDefault,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
