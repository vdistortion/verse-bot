import { Telegraf, Input, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { start, help, flagConnect } from './commands';
import { greeting, location } from './text';
import { getCat, getList } from './api/fetch';
import { getKeyboard } from './keyboard';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const API_KEY_OPENWEATHERMAP = process.env.API_KEY_OPENWEATHERMAP!;
const ALIASES = process.env.ALIASES!;
const IMAGE_SRC = process.env.IMAGE_SRC!;
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.command('start', start(JSON.parse(ALIASES)));
bot.command('help', help());
bot.command('flagConnect', flagConnect(IMAGE_SRC));
bot.command('cat', (ctx) => getCat().then((url) => ctx.replyWithPhoto(Input.fromURL(url))));
bot.command('item', (ctx) => getList().then((text) => ctx.replyWithHTML(text)));
bot.command('advice', (ctx) => ctx.reply('😈', Markup.keyboard(getKeyboard(true))));

bot.on(message('text'), greeting());
bot.on(message('location'), location(API_KEY_OPENWEATHERMAP));
bot.on(message('sticker'), (ctx) => ctx.reply('👀'));

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

//dev mode
ENVIRONMENT !== 'production' && development(bot);
