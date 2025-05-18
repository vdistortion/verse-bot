import { Bot, webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { start, help, flagConnect } from './commands';
import { greeting, location } from './text';
import { getCat, getList, getQuote } from './api/fetch';
import { getKeyboard, buttons } from './keyboard';
import { reply, replyWithPhoto } from './utils/reply';

const { TELEGRAM_BOT_TOKEN, OPENWEATHERMAP_API_KEY, ALIASES, IMAGE_SRC, NODE_ENV } = process.env;

const bot = new Bot(TELEGRAM_BOT_TOKEN!);

bot.command('start', start(JSON.parse(ALIASES!)));
bot.command('help', help());
bot.command(buttons.flags.command, flagConnect(IMAGE_SRC!));
bot.command(buttons.cat.command, (ctx) => getCat().then((url) => replyWithPhoto(ctx, url)));
bot.command('item', (ctx) => getList().then((text) => reply(ctx, text, { parseMode: 'HTML' })));
bot.command(buttons.quote.command, (ctx) =>
  getQuote().then((text) => reply(ctx, text, { parseMode: 'HTML' })),
);
bot.command(buttons.advice.command, (ctx) => reply(ctx, '😈', { keyboard: getKeyboard(true) }));
bot.command('stop', (ctx) => reply(ctx, 'Stopped', { removeKeyboard: true }));

bot.on('message:location', location(OPENWEATHERMAP_API_KEY!));
bot.on('message:sticker', (ctx) => reply(ctx, '👀'));
bot.on('message:text', greeting());

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production();
  webhookCallback(bot, 'https')(req, res);
};

//dev mode
NODE_ENV !== 'production' && development(bot);
