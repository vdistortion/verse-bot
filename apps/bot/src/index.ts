import { InputFile } from 'grammy';
import { createBot, dbMiddleware } from '@scope/tg-bot-core';
import { createVKBot, VKBot, VKContext } from '@scope/vk-bot-core';
import {
  getSupabaseClient,
  type UniversalContext,
  createUniversalKeyboard,
  createVKKeyboard,
} from '@scope/shared';
import {
  startCommand,
  idCommand,
  backupDbCommand,
  fullCommand,
  catCommand,
  quoteCommand,
  adviceCommand,
  randomCommand,
  contentCommand,
  stopCommand,
} from './commands';
import { escapeMarkdownV2 } from './utils/markdown';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_ID, VK_TOKEN, VK_GROUP_ID } from './env';

// ─── Telegram Bot ────────────────────────────────────────────────────────────
if (TELEGRAM_BOT_TOKEN) {
  try {
    const tgBot = createBot({ token: TELEGRAM_BOT_TOKEN });
    tgBot.use(dbMiddleware);

    tgBot.use(async (ctx, next) => {
      const uctx: UniversalContext = {
        platform: 'telegram',
        userId: ctx.from?.id ?? 0,
        peerId: ctx.chat?.id ?? 0,
        text: ctx.message?.text ?? '',
        isAdmin: ctx.from?.id === Number(TELEGRAM_ADMIN_ID),
        db: ctx.db,
        reply: async (text, extra) => {
          // Для Telegram, extra.telegramReplyMarkup должен быть объектом
          await ctx.reply(escapeMarkdownV2(text), {
            parse_mode: 'MarkdownV2',
            ...(extra?.telegramReplyMarkup && { reply_markup: extra.telegramReplyMarkup }),
          });
        },
        replyWithFile: async (buffer, filename, caption) => {
          await ctx.replyWithDocument(
            new InputFile(buffer, filename),
            caption
              ? { caption: escapeMarkdownV2(caption), parse_mode: 'MarkdownV2' }
              : { parse_mode: 'MarkdownV2' },
          );
        },
      };
      (ctx as any).uctx = uctx;
      await next();
    });

    tgBot.command('start', async (ctx) => {
      await startCommand((ctx as any).uctx);
    });

    tgBot.command('full', async (ctx) => {
      await fullCommand((ctx as any).uctx);
    });

    tgBot.command('cat', async (ctx) => {
      await catCommand((ctx as any).uctx);
    });

    tgBot.command('quote', async (ctx) => {
      await quoteCommand((ctx as any).uctx);
    });

    tgBot.command('advice', async (ctx) => {
      await adviceCommand((ctx as any).uctx);
    });

    tgBot.command('random', async (ctx) => {
      await randomCommand((ctx as any).uctx);
    });

    tgBot.command('content', async (ctx) => {
      const itemNumber = parseInt(ctx.match, 10);
      if (!isNaN(itemNumber)) {
        await contentCommand((ctx as any).uctx, itemNumber);
      } else {
        await ctx.reply('Пожалуйста, укажите номер контента. Например: /content 1');
      }
    });

    tgBot.command('stop', async (ctx) => {
      await stopCommand((ctx as any).uctx);
    });

    tgBot.command('id', async (ctx) => {
      await idCommand((ctx as any).uctx);
    });

    tgBot.command('backupdb', async (ctx) => {
      await backupDbCommand((ctx as any).uctx);
    });

    // Обработка текстовых кнопок Telegram
    tgBot.hears('Котики 🐾', async (ctx) => {
      await catCommand((ctx as any).uctx);
    });
    tgBot.hears('Цитаты 💬', async (ctx) => {
      await quoteCommand((ctx as any).uctx);
    });
    tgBot.hears('Советы 💡', async (ctx) => {
      await adviceCommand((ctx as any).uctx);
    });
    tgBot.hears('Рандом 🎲', async (ctx) => {
      await randomCommand((ctx as any).uctx);
    });
    tgBot.hears('Мой ID 🆔', async (ctx) => {
      await idCommand((ctx as any).uctx);
    });
    tgBot.hears('Стоп 🛑', async (ctx) => {
      await stopCommand((ctx as any).uctx);
    });

    tgBot.start();
    console.log('🚀 Telegram bot started');
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error);
    console.log('⚠️ Telegram is unavailable, continuing without it...');
  }
} else {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not set, skipping Telegram bot');
}

// ─── VK Bot ──────────────────────────────────────────────────────────────────
if (VK_TOKEN && VK_GROUP_ID) {
  try {
    const vkBot: VKBot = createVKBot({
      token: VK_TOKEN,
      groupId: Number(VK_GROUP_ID),
    });
    const db = getSupabaseClient();

    vkBot.on('message_new', async (ctx: VKContext) => {
      const text = ctx.text?.trim() ?? '';
      let payloadCommand: string | undefined;

      if (ctx.payload) {
        try {
          const parsedPayload = JSON.parse(ctx.payload);
          if (parsedPayload.command) {
            payloadCommand = parsedPayload.command;
          }
        } catch (e) {
          console.warn('Failed to parse VK payload:', e);
        }
      }

      const uctx: UniversalContext = {
        platform: 'vk',
        userId: ctx.userId,
        peerId: ctx.peerId,
        text,
        isAdmin: false,
        db,
        reply: async (msg, extra) => {
          // Для VK, extra.vkKeyboard должен быть JSON строкой
          await vkBot.sendMessage(ctx.peerId, msg, extra?.vkKeyboard);
        },
      };

      const commandToExecute = payloadCommand || text;

      if (
        commandToExecute === '/start' ||
        commandToExecute === '🚀 Запустить бота и показать основное меню'
      ) {
        await startCommand(uctx);
        return;
      }
      if (
        commandToExecute === '/full' ||
        commandToExecute === '🌟 Открыть полное меню с дополнительными функциями'
      ) {
        await fullCommand(uctx);
        return;
      }
      if (commandToExecute === '/cat' || commandToExecute === 'Котики 🐾') {
        await catCommand(uctx);
        return;
      }
      if (commandToExecute === '/quote' || commandToExecute === 'Цитаты 💬') {
        await quoteCommand(uctx);
        return;
      }
      if (commandToExecute === '/advice' || commandToExecute === 'Советы 💡') {
        await adviceCommand(uctx);
        return;
      }
      if (commandToExecute === '/random' || commandToExecute === 'Рандом 🎲') {
        await randomCommand(uctx);
        return;
      }
      if (commandToExecute.startsWith('/content ')) {
        const itemNumber = parseInt(commandToExecute.replace('/content ', ''), 10);
        if (!isNaN(itemNumber)) {
          await contentCommand(uctx, itemNumber);
        } else {
          await uctx.reply('Пожалуйста, укажите номер контента. Например: /content 1');
        }
        return;
      }
      if (commandToExecute === '/stop' || commandToExecute === 'Стоп 🛑') {
        await stopCommand(uctx);
        return;
      }
      if (commandToExecute === '/id' || commandToExecute === 'Мой ID 🆔') {
        await idCommand(uctx);
        return;
      }
      if (commandToExecute === '/backupdb') {
        await backupDbCommand(uctx);
        return;
      }

      // Если команда не распознана, показываем базовую клавиатуру
      await uctx.reply('❓ Неизвестная команда', {
        vkKeyboard: createVKKeyboard(createUniversalKeyboard('vk', false)),
      });
    });

    vkBot.start();
    console.log('🚀 VK bot started');
  } catch (error) {
    console.error('❌ Failed to start VK bot:', error);
    console.log('⚠️ VK is unavailable, continuing without it...');
  }
} else {
  console.log('⚠️ VK_TOKEN or VK_GROUP_ID not set, skipping VK bot');
}
