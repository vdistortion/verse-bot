import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { getQuote } from '../data-sources';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  try {
    const { quoteText, quoteAuthor } = await getQuote();
    const textTg = quoteAuthor
      ? `${escapeMarkdownV2(quoteText)}\n\n*${escapeMarkdownV2(quoteAuthor)}*`
      : escapeMarkdownV2(quoteText);
    const textVk = quoteAuthor ? `${quoteText}\n\n${quoteAuthor}` : quoteText;
    const text = ctx.platform === 'telegram' ? textTg : textVk;
    await ctx.reply(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении цитаты:', err);
    await ctx.reply(
      `❌ Ошибка при получении цитаты: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
