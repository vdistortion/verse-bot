import { Bot } from 'grammy';
import type { Update } from '@grammyjs/types';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import createDebug from 'debug';

const debug = createDebug('bot:production');
const VERCEL_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const production = async (req: VercelRequest, res: VercelResponse, bot: Bot) => {
  if (!VERCEL_URL) throw new Error('VERCEL_URL is not set.');
  const webhookUrl = `https://${VERCEL_URL}/api`;

  debug('Bot runs in production mode');
  debug(`setting webhook: ${webhookUrl}`);

  const getWebhookInfo = await bot.api.getWebhookInfo();
  if (getWebhookInfo.url !== webhookUrl) {
    debug(`deleting webhook ${getWebhookInfo.url}`);
    await bot.api.deleteWebhook();
    debug(`setting webhook: ${webhookUrl}`);
    await bot.api.setWebhook(webhookUrl);
  }

  if (req.method === 'POST') {
    await bot.handleUpdate(req.body as Update);
  } else {
    res.status(200).json(`Listening to bot events... ${webhookUrl}`);
  }
};
