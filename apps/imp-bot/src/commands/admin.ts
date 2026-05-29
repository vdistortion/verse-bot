import { requireAdmin } from '@verse/shared';
import { phrases } from '../locales/ru';

export const adminCommand = requireAdmin(async (ctx) => {
  await ctx.replySafe(phrases.admin.message(ctx.platform, ctx.dbUserId));
}, phrases);
