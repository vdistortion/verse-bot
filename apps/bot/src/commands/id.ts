import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function idCommand(ctx: UniversalContext): Promise<void> {
  const id = ctx.chatType === 'private' ? ctx.userId : ctx.peerId;
  const platform = ctx.platform;

  if (ctx.chatType === 'private') {
    await ctx.replySafe(phrases.id.message(platform, String(id)));
  } else {
    await ctx.replySafe(phrases.id.chatId(platform, id));
  }
}
