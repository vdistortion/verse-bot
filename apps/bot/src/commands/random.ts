import type { UniversalContext } from '@scope/shared';

export async function randomCommand(ctx: UniversalContext): Promise<void> {
  await ctx.reply('Случайный контент! (Логика для рандома пока не реализована)');
}
