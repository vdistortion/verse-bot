import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function idCommand(ctx: UniversalContext): Promise<void> {
  const id = ctx.chatType === 'private' ? ctx.userId : ctx.peerId;
  const platform = ctx.platform;

  if (ctx.chatType === 'private') {
    await ctx.reply(
      phrases.id.message(platform, String(id)),
      platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  } else {
    await ctx.reply(
      phrases.id.chatId(platform, id),
      platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
