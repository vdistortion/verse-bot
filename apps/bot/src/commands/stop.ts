import { removeUser, type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  await removeUser(ctx.platform, ctx.userId);
  await ctx.reply(phrases.stop(ctx.platform), {
    remove_keyboard: true,
    ...(ctx.platform === 'telegram' && { parse_mode: 'MarkdownV2' }),
  });
}
