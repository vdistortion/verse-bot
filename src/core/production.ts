import { Bot } from 'grammy';
import createDebug from 'debug';

const debug = createDebug('bot:production');
const VERCEL_URL = process.env.VERCEL_URL;

export const production = async (bot: Bot) => {
  if (!VERCEL_URL) throw new Error('VERCEL_URL is not set.');

  debug('Bot runs in production mode');
  debug(`setting webhook: ${VERCEL_URL}`);

  const getWebhookInfo = await bot.api.getWebhookInfo();

  if (getWebhookInfo.url !== `${VERCEL_URL}/api`) {
    debug(`deleting webhook ${VERCEL_URL}`);
    await bot.api.deleteWebhook();
    debug(`setting webhook: ${VERCEL_URL}/api`);
    await bot.api.setWebhook(`${VERCEL_URL}/api`);
  }
};
