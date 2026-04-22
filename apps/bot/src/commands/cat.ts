import type { UniversalContext } from '@scope/shared';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  await ctx.reply('Мяу! (Логика для котиков пока не реализована)');
}
