import { Bot } from 'grammy';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const VERCEL_URL = process.env.VERCEL_URL;

if (!TELEGRAM_BOT_TOKEN || !VERCEL_URL) {
  throw new Error('TELEGRAM_BOT_TOKEN или VERCEL_URL не установлены');
}

const bot = new Bot(TELEGRAM_BOT_TOKEN);
const webhookUrl = `https://${VERCEL_URL}/api`;

export default async function handler() {
  await bot.api
    .setWebhook(webhookUrl)
    .then(() => new Response(`Webhook установлен на ${webhookUrl}`))
    .catch(console.error)
    .finally(() => console.log({ webhookUrl, TELEGRAM_BOT_TOKEN }));
}
