import { GrammyError, HttpError, webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bot, commands, type Context, development, isDev, production } from './core';
import { advice, cat, help, id, image, imp, install, item, quote, start, stop } from './commands';
import { greeting, location, sticker } from './text';
import { runFlagsService } from './services/flagService';
import { getOperator } from './api';
import { ALIASES, KODYSU_API_KEY, OPENWEATHERMAP_API_KEY } from './env';

bot.command(commands.start.command, start(JSON.parse(ALIASES!)));
bot.command(commands.stop.command, stop());
bot.command(commands.help.command, help(commands));
bot.command(commands.cat.command, cat());
bot.command(commands.quote.command, quote());
bot.command(commands.advice.command, advice());
bot.command('install', install(commands));
bot.command('id', id());
bot.command('imp', imp(commands));
bot.command('item', item());
bot.command('image', image());

runFlagsService();

bot.hears(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/, async (ctx: Context) => {
  // @ts-ignore
  const answer = await getOperator(KODYSU_API_KEY!, ctx.message.text);
  if (answer.success) await ctx.reply(answer.numbers[0].operator);
  else await ctx.reply(answer.error_message);
});

bot.on('message:location', location(OPENWEATHERMAP_API_KEY!));
bot.on('message:sticker', sticker());
bot.on('message:text', greeting());

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
isDev && development();
