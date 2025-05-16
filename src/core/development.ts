import { Bot } from 'grammy';
import createDebug from 'debug';

const debug = createDebug('bot:development');

const development = async (bot: Bot) => {
  const botInfo = (await bot.api.getMe()).username;

  debug('Bot runs in development mode');
  debug(`${botInfo} deleting webhook`);
  await bot.api.deleteWebhook();
  debug(`${botInfo} starting polling`);

  await bot.start();

  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
};

export { development };
