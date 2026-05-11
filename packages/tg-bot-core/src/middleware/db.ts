import type { MiddlewareFn } from 'grammy';
import { db } from '@scope/shared';
import type { BotContext } from '../types';

export const dbMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  ctx.db = db();
  await next();
};
