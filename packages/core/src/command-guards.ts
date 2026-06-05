import type { UniversalContext } from './context.js';

export type CommandHandler = (ctx: UniversalContext, ...args: any[]) => Promise<void>;

export function requireAdmin(handler: CommandHandler) {
  return async (ctx: UniversalContext, ...args: any[]) => {
    if (ctx.chatType !== 'private') return;
    if (!ctx.isAdmin) return;
    return handler(ctx, ...args);
  };
}

export function requirePrivateChat(handler: CommandHandler) {
  return async (ctx: UniversalContext, ...args: any[]) => {
    if (ctx.chatType !== 'private') return;
    return handler(ctx, ...args);
  };
}

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
