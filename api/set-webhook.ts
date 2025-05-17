import { Bot } from 'grammy';

const VERCEL_URL =
  process.env.VERCEL_URL || 'imp-telegram-lcn6dlvdf-ws1wm6ok881jhqvrt4w.vercel.app';
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

export default async function handler() {
  if (!VERCEL_URL) return new Response('Unauthorized', { status: 401 });

  const webhookUrl = `https://${VERCEL_URL}/api`;

  try {
    await bot.api.setWebhook(webhookUrl);
    return new Response(`Webhook установлен: ${webhookUrl}`);
  } catch (err) {
    console.error('Ошибка при установке webhook:', err);
    return new Response('Ошибка при установке webhook', { status: 500 });
  }
}
