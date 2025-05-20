import { Bot, webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { commands, development, production } from './core';
import { start, stop, cat, item, quote, advice, help, flagConnect, imp } from './commands';
import { greeting, location, sticker } from './text';
import {
  ALIASES,
  FLAG_CONNECT,
  NODE_ENV,
  OPENWEATHERMAP_API_KEY,
  TELEGRAM_BOT_TOKEN,
} from './utils/env';

export const bot = new Bot(TELEGRAM_BOT_TOKEN!);

bot.command(commands.start.command, start(JSON.parse(ALIASES!)));
bot.command(commands.stop.command, stop());
bot.command(commands.help.command, help());
bot.command('item', item());
bot.command(commands.flags.command, flagConnect(FLAG_CONNECT!));
bot.command(commands.cat.command, cat());
bot.command(commands.quote.command, quote());
bot.command(commands.advice.command, advice());
bot.command('imp', imp());

bot.on('message:location', location(OPENWEATHERMAP_API_KEY!));
bot.on('message:sticker', sticker());
bot.on('message:text', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production();
  webhookCallback(bot, 'https')(req, res);
};

//dev mode
NODE_ENV !== 'production' && development(bot);
