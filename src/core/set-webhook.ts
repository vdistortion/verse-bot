import { Bot } from 'grammy';

const token = process.env.BOT_TOKEN;
const domain = process.env.VERCEL_URL;

if (!token || !domain) {
  throw new Error('BOT_TOKEN или VERCEL_URL не установлены');
}

const bot = new Bot(token);
const webhookUrl = `https://${domain}/api`;

bot.api
  .setWebhook(webhookUrl)
  .then(() => console.log(`Webhook установлен на ${webhookUrl}`))
  .catch(console.error);
