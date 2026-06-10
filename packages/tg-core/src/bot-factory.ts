import { Bot } from 'grammy';
import { errorHandler, loggerMiddleware } from './middleware/index.js';
import type { BotContext } from './types/index.js';

export interface BotFactoryOptions {
  token: string;
  useLogger?: boolean;
}

export function createBot(options: BotFactoryOptions): Bot<BotContext> {
  const { token, useLogger = true } = options;
  const bot = new Bot<BotContext>(token);

  bot.catch(errorHandler);

  if (useLogger) {
    bot.use(loggerMiddleware);
  }

  return bot;
}
