import type { UniversalContext } from './context.js';
import type { RichMessage } from './types.js';

export type CommandHandler<Args extends unknown[] = unknown[]> = (
  ctx: UniversalContext,
  ...args: Args
) => Promise<void>;
export interface Phrases {
  errorDefault: (ctx: UniversalContext) => RichMessage;
}

export function requireAdmin<Args extends unknown[]>(handler: CommandHandler<Args>) {
  return async (ctx: UniversalContext, ...args: Args) => {
    if (ctx.chatType !== 'private') return;
    if (!ctx.isAdmin) return;
    return handler(ctx, ...args);
  };
}

export function requirePrivateChat<Args extends unknown[]>(handler: CommandHandler<Args>) {
  return async (ctx: UniversalContext, ...args: Args) => {
    if (ctx.chatType !== 'private') return;
    return handler(ctx, ...args);
  };
}

export function catchErrors<Args extends unknown[]>(handler: CommandHandler<Args>, phrases: Phrases) {
  return async (ctx: UniversalContext, ...args: Args) => {
    try {
      return await handler(ctx, ...args);
    } catch (err) {
      console.error('Command error:', err);
      await ctx.replySafe(phrases.errorDefault(ctx));
    }
  };
}
