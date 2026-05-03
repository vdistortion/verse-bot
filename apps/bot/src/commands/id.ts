import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function idCommand(ctx: UniversalContext): Promise<void> {
  const isTg = ctx.platform === 'telegram';
  const id = ctx.chatType === 'private' ? ctx.userId : ctx.peerId;
  const platform = ctx.platform;

  if (ctx.chatType === 'private') {
    await ctx.reply(
      isTg ? phrases.id.messageTg(platform, String(id)) : phrases.id.message(platform, String(id)),
      isTg ? { parse_mode: 'MarkdownV2' } : {},
    );
  } else {
    await ctx.reply(
      isTg ? phrases.id.chatId(isTg, id) : phrases.id.chatId(isTg, id),
      isTg ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
