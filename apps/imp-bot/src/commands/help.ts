import { type UniversalContext } from '@verse-bot/core';
import { phrases } from '../locales/ru.js';
import { formatFor } from '../format.js';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  const message = phrases.help.getMessage(formatFor(ctx.platform), ctx.platform);

  await ctx.replySafe(message, {
    link_preview_options: ctx.platform === 'telegram' ? { is_disabled: true } : undefined,
  });
}
