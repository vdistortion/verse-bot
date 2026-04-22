import type { UniversalContext } from '@scope/shared';

export async function adviceCommand(ctx: UniversalContext): Promise<void> {
  await ctx.reply('Вот тебе совет! (Логика для советов пока не реализована)');
}
