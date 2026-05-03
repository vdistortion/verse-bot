import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  const message = phrases.help.getMessage({
    platform: ctx.platform,
    isAdmin: ctx.isAdmin ?? false,
    chatType: ctx.chatType,
  });

  await ctx.reply(message, {
    parse_mode: ctx.platform === 'telegram' ? 'MarkdownV2' : undefined,
    link_preview_options: ctx.platform === 'telegram' ? { is_disabled: true } : undefined,
  });
}
