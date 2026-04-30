import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { getAdvice } from '../data-sources';

export async function adviceCommand(ctx: UniversalContext): Promise<void> {
  try {
    const adviceText = await getAdvice();
    const text = ctx.platform === 'telegram' ? escapeMarkdownV2(adviceText) : adviceText;
    await ctx.reply(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении совета:', err);
    await ctx.reply(
      `❌ Ошибка при получении совета: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
