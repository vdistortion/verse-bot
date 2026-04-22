import type { UniversalContext } from '@scope/shared';

export async function quoteCommand(ctx: UniversalContext): Promise<void> {
  await ctx.reply('Мудрые слова! (Логика для цитат пока не реализована)');
}
