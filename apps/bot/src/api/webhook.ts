import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createBot } from '@scope/tg-bot-core';
import { createVKWebhookProcessor, VKSendMessageFunction } from '@scope/vk-bot-core';

let botInstance: ReturnType<typeof createBot> | null = null;
let botInitPromise: Promise<void> | null = null;

function getBot() {
  if (!botInstance) {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }

    botInstance = createBot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    });

    botInitPromise = botInstance.init();
  }

  return { bot: botInstance, init: botInitPromise! };
}

const sendVKMessage: VKSendMessageFunction = async (peerId, text, keyboard) => {
  const token = process.env.VK_TOKEN;
  if (!token) {
    console.error('VK_TOKEN is not defined');
    return null;
  }

  const url = new URL('https://api.vk.com/method/messages.send');
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
      console.error('VK send error:', data.error);
    }
    return data.response;
  } catch (error) {
    console.error('VK send failed:', error);
    return null;
  }
};

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
      const { bot, init } = getBot();

      try {
        await init;
        await bot.handleUpdate(body);

        return res.status(200).send('ok');
      } catch (e) {
        console.error('Telegram handleUpdate error:', e);
        return res.status(500).send('tg error');
      }
    }

    if (body.type) {
      if (!process.env.VK_TOKEN || !process.env.VK_GROUP_ID) {
        return res.status(500).send('VK env not set');
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
        await ctx.sendMessage(ctx.peerId, 'Привет из ВК (через вебхук)!');
      });

      await vkProcessor.processUpdate(body);

      return res.status(200).send('ok');
    }

    return res.status(400).send('Unknown payload');
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(500).send('Internal error');
  }
};
