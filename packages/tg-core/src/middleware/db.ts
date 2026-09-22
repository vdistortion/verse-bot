import type { MiddlewareFn } from 'grammy';
import type { BotContext } from '../types/index.js';

export function createDbMiddleware(db?: BotContext['db']): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    ctx.db = db;
    await next();
  };
}
