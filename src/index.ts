import { GrammyError, HttpError, webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bot, commands, development, isDev, production } from './core';
import { advice, cat, help, id, image, imp, item, quote, start, stop } from './commands';
import { greeting, location, sticker } from './text';
import { runFlagsService } from './services/flagService';
import { ALIASES, OPENWEATHERMAP_API_KEY } from './env';

bot.command(commands.start.command, start(JSON.parse(ALIASES!)));
bot.command(commands.stop.command, stop());
bot.command(commands.help.command, help(commands));
bot.command(commands.cat.command, cat());
bot.command(commands.quote.command, quote());
bot.command(commands.advice.command, advice());
bot.command('id', id());
bot.command('imp', imp(commands));
bot.command('item', item());
bot.command('image', image());

runFlagsService();

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
