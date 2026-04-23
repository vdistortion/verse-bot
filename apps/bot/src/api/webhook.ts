import { webhookCallback } from 'grammy';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBot } from '@scope/tg-bot-core';
import { createVKWebhookProcessor, VKSendMessageFunction } from '@scope/vk-bot-core';
import { VERCEL_PROJECT_PRODUCTION_URL } from '../env';

const sendVKMessage: VKSendMessageFunction = async (peerId, text, keyboard) => {
  const token = process.env.VK_TOKEN;
  if (!token) {
    console.error('VK_TOKEN is not defined for sending messages.');
    return null;
  }

  const url = new URL(`https://api.vk.com/method/messages.send`);
  url.searchParams.set('access_token', token);
  url.searchParams.set('v', '5.131');
  url.searchParams.set('peer_id', String(peerId));
  url.searchParams.set('message', text);
  url.searchParams.set('random_id', String(Date.now()));

  if (keyboard) {
    url.searchParams.set('keyboard', keyboard);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();
    if (data.error) {
      console.error('Error sending VK message:', data.error);
    }
    return data.response;
  } catch (error) {
    console.error('Failed to send VK message:', error);
    return null;
  }
};

function getPlatform(req: VercelRequest): string | undefined {
  const p = req.query.platform;
  return Array.isArray(p) ? p[0] : p;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') {
    return res.status(200).send('ok');
  }

  const platform = getPlatform(req);

  if (platform === 'tg' && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const bot = createBot({
        token: process.env.TELEGRAM_BOT_TOKEN,
      });

      if (VERCEL_PROJECT_PRODUCTION_URL) {
        const webhookUrl = `https://${VERCEL_PROJECT_PRODUCTION_URL}/api/webhook?platform=tg`;

        try {
          const webhookInfo = await bot.api.getWebhookInfo();

          if (webhookInfo.url !== webhookUrl) {
            console.log('[Telegram] Updating webhook...');
            await bot.api.deleteWebhook();
            await bot.api.setWebhook(webhookUrl);
          }
        } catch (e) {
          console.error('Failed to check/set Telegram webhook:', e);
        }
      }

      return webhookCallback(bot, 'https')(req, res);
    } catch (error) {
      console.error('❌ Error processing Telegram webhook:', error);
      return res.status(500).send('Telegram webhook processing failed');
    }
  }

  if (platform === 'vk' && process.env.VK_TOKEN && process.env.VK_GROUP_ID) {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      if (!body) {
        return res.status(400).send('Empty body');
      }

      if (body.type === 'confirmation') {
        return res.status(200).send(process.env.VK_CONFIRMATION ?? '');
      }

      const vkProcessor = createVKWebhookProcessor(
        {
          token: process.env.VK_TOKEN,
          groupId: Number(process.env.VK_GROUP_ID),
          secret: process.env.VK_SECRET,
        },
        sendVKMessage,
      );

      vkProcessor.on('message_new', async (ctx) => {
        await ctx.sendMessage(ctx.peerId, 'Привет из ВК (через вебхук)! Я тоже на общем ядре.');
      });

      await vkProcessor.processUpdate(body);
      return res.status(200).send('ok');
    } catch (error) {
      console.error('❌ Error processing VK webhook:', error);
      return res.status(500).send('VK webhook processing failed');
    }
  }

  return res.status(404).send('Platform not supported or token missing');
};
