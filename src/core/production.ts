import createDebug from 'debug';
import { bot } from '../index';

const debug = createDebug('bot:production');

const VERCEL_URL = process.env.VERCEL_URL;

if (!VERCEL_URL) throw new Error('VERCEL_URL is not set.');

debug('Bot runs in production mode');
debug(`setting webhook: ${VERCEL_URL}`);

bot.api.getWebhookInfo().then(async (getWebhookInfo) => {
  if (getWebhookInfo.url !== `${VERCEL_URL}/api`) {
    debug(`deleting webhook ${VERCEL_URL}`);
    await bot.api.deleteWebhook();
    debug(`setting webhook: ${VERCEL_URL}/api`);
    await bot.api.setWebhook(`${VERCEL_URL}/api`);
  }
});
