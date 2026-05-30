import type { MiddlewareFn } from 'grammy';
import { getPool } from '@verse-bot/shared';
import type { BotContext } from '../types/index.js';

export const dbMiddleware: MiddlewareFn<BotContext> = async (ctx, next) => {
  try {
    ctx.db = getPool();
  } catch {
    // pool не инициализирован — бот работает без БД
  }
  await next();
};
