import type { UniversalContext } from '@scope/shared';

export async function idCommand(ctx: UniversalContext): Promise<void> {
  const message = `🆔 *Ваш ID:* \`${ctx.userId}\`;
📍 *Платформа:* ${ctx.platform}`;

  await ctx.reply(message);
}
