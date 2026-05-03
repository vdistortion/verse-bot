import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { getAdvice } from '../data-sources';
import { phrases } from '../locales/ru';

export async function adviceCommand(ctx: UniversalContext): Promise<void> {
  try {
    const adviceText = await getAdvice();
    const text = ctx.platform === 'telegram' ? escapeMarkdownV2(adviceText) : adviceText;
    await ctx.reply(text, ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {});
  } catch (err) {
    console.error('Advice error:', err);
    await ctx.reply(
      phrases.errorDefault,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
