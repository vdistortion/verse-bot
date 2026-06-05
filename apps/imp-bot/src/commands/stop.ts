import type { UniversalContext } from '@verse-bot/core';
import { removeUser } from '@verse-bot/db';
import { phrases } from '../locales/ru.js';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  await removeUser(ctx.platform, ctx.userId);
  await ctx.replySafe(phrases.stop(ctx.platform), { remove_keyboard: true });
}
