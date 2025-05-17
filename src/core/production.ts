import { Bot } from 'grammy';
import type { Update } from 'grammy/types';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import createDebug from 'debug';

const debug = createDebug('bot:development');

const VERCEL_URL = process.env.VERCEL_URL;

const production = async (req: VercelRequest, res: VercelResponse, bot: Bot) => {
  if (!VERCEL_URL) throw new Error('VERCEL_URL is not set.');

  debug('Bot runs in production mode');
  debug(`setting webhook: ${VERCEL_URL}`);

  const getWebhookInfo = await bot.api.getWebhookInfo();
  if (getWebhookInfo.url !== VERCEL_URL + '/api') {
    debug(`deleting webhook ${VERCEL_URL}`);
    await bot.api.deleteWebhook();
    debug(`setting webhook: ${VERCEL_URL}/api`);
    await bot.api.setWebhook(`${VERCEL_URL}/api`);
  }

  if (req.method === 'POST') {
    await bot.handleUpdate(req.body as Update);
  } else {
    res.status(200).json('Listening to bot events...');
  }
};

export { production };
