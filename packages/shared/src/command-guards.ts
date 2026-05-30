import type { UniversalContext } from './universal-context.js';

export type CommandHandler = (ctx: UniversalContext, ...args: any[]) => Promise<void>;

/**
 * Обёртка: требует приватный чат и права администратора.
 */
export function requireAdmin(handler: CommandHandler, phrases: any) {
  return async (ctx: UniversalContext, ...args: any[]) => {
    if (ctx.chatType !== 'private') return;
    if (!ctx.isAdmin) {
      await ctx.replySafe(phrases.admin.notAdmin(ctx.platform));
      return;
    }
    return handler(ctx, ...args);
  };
}

/**
 * Обёртка: требует приватный чат.
 */
export function requirePrivateChat(handler: CommandHandler) {
  return async (ctx: UniversalContext, ...args: any[]) => {
    if (ctx.chatType !== 'private') return;
    return handler(ctx, ...args);
  };
}

/**
 * Обёртка: перехватывает ошибки и отвечает стандартной фразой.
 */
export function catchErrors(handler: CommandHandler, phrases: any) {
  return async (ctx: UniversalContext, ...args: any[]) => {
    try {
      return await handler(ctx, ...args);
    } catch (err) {
      console.error('Command error:', err);
      await ctx.replySafe(phrases.errorDefault(ctx.platform));
    }
  };
}
