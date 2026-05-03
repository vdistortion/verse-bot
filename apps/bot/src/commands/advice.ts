import type { UniversalContext } from '@scope/shared';
import { getAdvice } from '../data-sources';
import { phrases } from '../locales/ru';

export async function adviceCommand(ctx: UniversalContext): Promise<void> {
  try {
    const adviceText = await getAdvice();
    await ctx.reply(
      ctx.format`${adviceText}`,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  } catch (err) {
    console.error('Advice error:', err);
    await ctx.reply(
      phrases.errorDefault,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
