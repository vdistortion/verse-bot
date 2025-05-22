import { Bot, GrammyError, HttpError, webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { commands, development, production } from './core';
import { advice, cat, help, id, image, imp, item, quote, start, stop } from './commands';
import { greeting, location, sticker } from './text';
import { ALIASES, NODE_ENV, OPENWEATHERMAP_API_KEY, TELEGRAM_BOT_TOKEN } from './utils/env';
import { homepage } from '../package.json';
import { runFlagsService } from './services/flagService';

export const bot = new Bot(TELEGRAM_BOT_TOKEN!);
const isDev = NODE_ENV !== 'production';

bot.command(commands.start.command, start(JSON.parse(ALIASES!)));
bot.command(commands.stop.command, stop());
bot.command(commands.help.command, help());
bot.command('item', item());
bot.command('image', image());
bot.command(commands.cat.command, cat());
bot.command(commands.quote.command, quote());
bot.command(commands.advice.command, advice());
bot.command('id', id());
bot.command('imp', imp(setSpecification));

runFlagsService(bot);

bot.on('message:location', location(OPENWEATHERMAP_API_KEY!));
bot.on('message:sticker', sticker());
bot.on('message:text', greeting());

async function setSpecification() {
  await bot.api.setMyName(isDev ? '😈 LocalImpBot' : '😈 ImpBot 😈');

  await bot.api.setMyCommands([
    { command: commands.start.command, description: commands.start.description },
    { command: commands.flags.command, description: commands.flags.description },
    { command: commands.quote.command, description: commands.quote.description },
    { command: commands.cat.command, description: commands.cat.description },
    { command: commands.help.command, description: commands.help.description },
    { command: commands.stop.command, description: commands.stop.description },
  ]);

  await bot.api.setMyShortDescription(
    'Бот отправляет погоду и котиков 🐈\nА ещё цитаты и ценные советы 🤭',
  );

  await bot.api.setMyDescription(`
Команды:
/${commands.start.command} — ${commands.start.description}
/${commands.flags.command} — ${commands.flags.description}
/${commands.quote.command} — ${commands.quote.description}
/${commands.cat.command} — ${commands.cat.description}
/${commands.help.command} — ${commands.help.description}
/${commands.stop.command} — ${commands.stop.description}
${commands.location.description}

Исходный код:
${homepage}
  `);
}

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
isDev && development(bot);
