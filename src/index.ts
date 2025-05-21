import { Bot, GrammyError, HttpError, webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { commands, development, production } from './core';
import { start, stop, cat, item, quote, advice, help, flagConnect, imp, image } from './commands';
import { greeting, location, sticker } from './text';
import {
  ALIASES,
  FLAG_CONNECT,
  NODE_ENV,
  OPENWEATHERMAP_API_KEY,
  TELEGRAM_BOT_TOKEN,
} from './utils/env';
import { getApiCountries } from './api';

export const bot = new Bot(TELEGRAM_BOT_TOKEN!);

bot.command(commands.start.command, start(JSON.parse(ALIASES!)));
bot.command(commands.stop.command, stop());
bot.command(commands.help.command, help());
bot.command('item', item());
bot.command('image', image());
bot.command(commands.flags.command, flagConnect(FLAG_CONNECT!));
bot.command(commands.cat.command, cat());
bot.command(commands.quote.command, quote());
bot.command(commands.advice.command, advice());
bot.command('imp', imp());

bot.on('message:location', location(OPENWEATHERMAP_API_KEY!));
bot.on('message:sticker', sticker());
bot.on('message:text', greeting(FLAG_CONNECT!));

bot.on('callback_query:data', async (ctx) => {
  const countries = await getApiCountries(FLAG_CONNECT!);
  const data: string = ctx.callbackQuery.data;
  const [action, countryIndex, correctCountryIndex] = data.split('|');
  const countryName: string = countries[Number(countryIndex)].name.ru;
  const correctCountryName: string = countries[Number(correctCountryIndex)].name.ru;

  if (action === 'flag_answer') {
    const answer =
      countryIndex === correctCountryIndex
        ? `☑️ Правильно, это ${correctCountryName}\n/flag_connect`
        : `Вы ответили ${countryName}.\n❌ Неправильно, это ${correctCountryName}\n/flag_connect`;
    await ctx.editMessageCaption({
      caption: answer,
      reply_markup: {
        inline_keyboard: [],
      },
    });
  }
  if (data === 'more') {
    flagConnect(FLAG_CONNECT!);
  }
  await ctx.answerCallbackQuery();
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

//prod mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production();
  webhookCallback(bot, 'https')(req, res);
};

//dev mode
NODE_ENV !== 'production' && development(bot);
