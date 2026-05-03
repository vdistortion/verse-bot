import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function adminCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.replySafe(phrases.admin.notAdmin);
    return;
  }
  await ctx.replySafe(phrases.admin.message(ctx.platform));
}
