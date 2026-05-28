import type { ErrorHandler } from 'grammy';
import type { BotContext } from '../types';

export const errorHandler: ErrorHandler<BotContext> = (err) => {
  const ctx = err.ctx;
  console.error(`[Error] Update ${ctx.update.update_id}:`);
  console.error(err.error);
};
