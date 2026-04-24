import type { VercelRequest, VercelResponse } from '@vercel/node';
import { webhookCallback } from 'grammy';
import { tgBot, vkBot } from '../';
import { VK_CONFIRMATION } from '../env';

function getBot() {
  if (!tgBot) {
    throw new Error('Telegram bot instance is not initialized in index.ts');
  }

  return { bot: tgBot, init: Promise.resolve() };
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(200).send('ok');
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!body) {
      return res.status(400).send('Empty body');
    }

    if (body.update_id) {
      try {
        const { bot } = getBot();
        return await webhookCallback(bot, 'https')(req, res);
      } catch (error) {
        console.error('❌ Webhook error:', error);
        return res.status(500).send('Internal error');
      }
    }

    if (body.type) {
      if (!vkBot) {
        // Проверяем, инициализирован ли vkBot
        return res.status(500).send('VK bot not initialized');
      }

      if (body.type === 'confirmation') {
        return res.status(200).send(VK_CONFIRMATION ?? '');
      }

      // Используем глобальный vkBot для обработки обновления
      await vkBot.processUpdate(body);
      return res.status(200).send('ok');
    }

    return res.status(400).send('Unknown payload');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).send('Internal error');
  }
};
