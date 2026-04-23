import type { UniversalContext } from '@scope/shared';
import { getAdvice } from '../data-sources';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function adviceCommand(ctx: UniversalContext): Promise<void> {
  try {
    const adviceText = await getAdvice();

    if (adviceText) {
      await ctx.reply(escapeMarkdownV2(adviceText));
      return;
    }

    await ctx.reply('Не удалось получить совет. Попробуйте ещё раз!');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении совета:', err);
    await ctx.reply(`❌ Произошла ошибка при получении совета: ${escapeMarkdownV2(msg)}`);
  }
}
