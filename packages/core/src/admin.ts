import type { UniversalAdminCheck, UniversalContext } from './context.js';

export async function checkUniversalAdmin(
  ctx: UniversalContext,
  checkAdmin?: UniversalAdminCheck,
): Promise<boolean> {
  if (ctx.isAdmin || !checkAdmin) return ctx.isAdmin;
  return checkAdmin(ctx);
}
