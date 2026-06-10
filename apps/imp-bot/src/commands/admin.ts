import { requireAdmin } from '@verse-bot/core';
import { phrases } from '../locales/ru.js';

export const adminCommand = requireAdmin(async (ctx) => {
  await ctx.replySafe(phrases.admin.message(ctx.format, ctx.platform, ctx.dbUserId));
});
