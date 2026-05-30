import { requireAdmin } from '@verse-bot/shared';
import { phrases } from '../locales/ru.js';

export const adminCommand = requireAdmin(async (ctx) => {
  await ctx.replySafe(phrases.admin.message(ctx.platform, ctx.dbUserId));
}, phrases);
