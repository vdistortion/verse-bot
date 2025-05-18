import type { Bot } from 'grammy';
import createDebug from 'debug';

const debug = createDebug('bot:development');

export const development = async (bot: Bot) => {
  const { username } = await bot.api.getMe();

  debug('Bot runs in development mode');
  debug(`${username} deleting webhook`);
  await bot.api.deleteWebhook();
  debug(`${username} starting polling`);

  await bot.start();

  process.once('SIGINT', () => bot.stop());
  process.once('SIGTERM', () => bot.stop());
};
