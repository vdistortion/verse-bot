import type { MiddlewareFn } from 'grammy';
import { getPool } from '@scope/shared';
import type { BotContext } from '../types';

export const dbMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  ctx.db = getPool();
  await next();
};
