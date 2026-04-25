import type { UniversalContext } from '@scope/shared';
import { getQuote } from '../data-sources';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  try {
    const { quoteText, quoteAuthor } = await getQuote();
    const textTg = quoteAuthor ? `${escapeMarkdownV2(quoteText)}\n\n*${escapeMarkdownV2(quoteAuthor)}*` : escapeMarkdownV2(quoteText);
    const textVk = quoteAuthor ? `${quoteText}\n\n${quoteAuthor}` : quoteText;
    const text = ctx.platform === 'telegram' ? textTg : textVk;
    await ctx.reply(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении цитаты:', err);
    await ctx.reply(`❌ Ошибка при получении цитаты: ${escapeMarkdownV2(msg)}`);
  }
}
