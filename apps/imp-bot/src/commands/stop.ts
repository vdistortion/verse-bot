import { removeUser, type UniversalContext } from '@verse/shared';
import { phrases } from '../locales/ru';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  await removeUser(ctx.platform, ctx.userId);
  await ctx.replySafe(phrases.stop(ctx.platform), { remove_keyboard: true });
}
