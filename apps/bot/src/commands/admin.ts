import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function adminCommand(ctx: UniversalContext): Promise<void> {
  if (ctx.chatType !== 'private') {
    return;
  }

  if (!ctx.isAdmin) {
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.admin.notAdmin : phrases.admin.notAdmin,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
    return;
  }

  await ctx.reply(
    phrases.admin.message(ctx.platform === 'telegram'),
    ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
  );
}
