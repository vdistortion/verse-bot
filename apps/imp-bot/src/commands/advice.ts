import { type UniversalContext } from '@verse/shared';
import { getAdvice } from '../data-sources';
import { phrases } from '../locales/ru';

export async function adviceCommand(ctx: UniversalContext): Promise<void> {
  try {
    const adviceText = await getAdvice();
    await ctx.replySafe(ctx.format`${adviceText}`);
  } catch (err) {
    console.error('Advice error:', err);
    await ctx.replySafe(phrases.errorDefault(ctx.platform));
  }
}
