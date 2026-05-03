import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  const message = phrases.help.getMessage({
    platform: ctx.platform,
    isAdmin: ctx.isAdmin ?? false,
    chatType: ctx.chatType,
  });

  await ctx.replySafe(message, {
    link_preview_options: ctx.platform === 'telegram' ? { is_disabled: true } : undefined,
  });
}
