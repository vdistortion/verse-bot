import type { UniversalContext } from '@scope/shared';
import { getQuote } from '../data-sources';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  try {
    const quoteText = await getQuote();

    if (quoteText) {
      const text = ctx.platform === 'telegram' ? escapeMarkdownV2(quoteText) : quoteText;
      await ctx.reply(text);
      return;
    }

    await ctx.reply('Не удалось получить цитату. Попробуйте ещё раз!');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении цитаты:', err);
    const errText =
      ctx.platform === 'telegram'
        ? `❌ Произошла ошибка при получении цитаты: ${escapeMarkdownV2(msg)}`
        : `❌ Произошла ошибка при получении цитаты: ${msg}`;
    await ctx.reply(errText);
  }
}
