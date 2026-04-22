import type { UniversalContext } from '@scope/shared';

export async function contentCommand(ctx: UniversalContext, itemNumber: number): Promise<void> {
  await ctx.reply(
    `Запрошен контент номер ${itemNumber}! (Логика для контента пока не реализована)`,
  );
}
