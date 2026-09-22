import { requireAdmin } from '@verse-bot/core';
import { phrases } from '../locales/ru.js';
import { formatFor } from '../format.js';

export const adminCommand = requireAdmin(async (ctx) => {
  await ctx.replySafe(phrases.admin.message(formatFor(ctx.platform), ctx.platform, ctx.dbUserId));
});
