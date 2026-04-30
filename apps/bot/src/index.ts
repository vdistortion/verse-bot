import { InputFile } from 'grammy';
import {
  getSupabaseClient,
  createUniversalKeyboard,
  createVKKeyboard,
  createUniversalSettingsKeyboard,
  type UniversalContext,
  userExists,
} from '@scope/shared';
import {
  createBot,
  createTelegramKeyboard,
  dbMiddleware,
  escapeMarkdownV2,
} from '@scope/tg-bot-core';
import { createVKBot, VKContext } from '@scope/vk-bot-core';
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
  helpCommand,
  listUsersCommand,
  linkBotCommand,
} from './commands';
import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_ID,
  VK_TOKEN,
  VK_GROUP_ID,
  VK_ADMIN_ID,
  VK_SECRET,
} from './env';

export const tgBot = TELEGRAM_BOT_TOKEN ? createBot({ token: TELEGRAM_BOT_TOKEN }) : null;
export const vkBot =
  VK_TOKEN && VK_GROUP_ID
    ? createVKBot({
        token: VK_TOKEN,
        groupId: Number(VK_GROUP_ID),
        secret: VK_SECRET,
      })
    : null;

// ─── Telegram Bot ────────────────────────────────────────────────────────────
if (tgBot) {
  try {
    tgBot.use(dbMiddleware);

    tgBot.use(async (ctx, next) => {
      const uctx: UniversalContext = {
        platform: 'telegram',
        userId: String(ctx.from?.id ?? 0),
        peerId: ctx.chat?.id ?? 0,
        text: ctx.message?.text ?? '',
        isAdmin: ctx.from?.id === Number(TELEGRAM_ADMIN_ID),
        db: ctx.db,
        reply: async (text, extra) => {
          // Для Telegram, extra.telegramReplyMarkup должен быть объектом
          await ctx.reply(text, {
            parse_mode: 'MarkdownV2',
            ...(extra?.telegramReplyMarkup && { reply_markup: extra.telegramReplyMarkup }),
            ...(extra?.remove_keyboard && { reply_markup: { remove_keyboard: true } }),
          });
        },
        replyWithFile: async (buffer, filename, caption) => {
          await ctx.replyWithDocument(
            new InputFile(buffer, filename),
            caption ? { caption, parse_mode: 'MarkdownV2' } : { parse_mode: 'MarkdownV2' },
          );
        },
        replyWithPhoto: async (photoUrl, caption) => {
          await ctx.replyWithPhoto(photoUrl, {
            caption: caption ?? undefined,
            parse_mode: 'MarkdownV2',
          });
        },
      };
      (ctx as any).uctx = uctx;
      await next();
    });

    // Guard: пропускаем /start всегда, остальное — только зарегистрированным
    tgBot.use(async (ctx, next) => {
      const text = ctx.message?.text ?? '';
      const isStart = text === '/start' || text.startsWith('/start ');

      if (isStart) {
        console.log(`[TG Guard] User ${ctx.from?.id} is calling /start. Proceeding.`);
        return next();
      }

      const uctx: UniversalContext = (ctx as any).uctx;
      if (!uctx) {
        console.error(`[TG Guard] uctx is undefined for user ${ctx.from?.id}. Skipping guard.`);
        return next();
      }

      const exists = await userExists('telegram', uctx.userId);
      console.log(`[TG Guard] User ${uctx.userId} exists: ${exists}. Command: ${text}`);

      if (!exists) {
        console.log(`[TG Guard] User ${uctx.userId} does not exist. Blocking command: ${text}`);
        return;
      }

      return next();
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
      const uctx = (ctx as any).uctx;
      if (!isNaN(itemNumber)) {
        await contentCommand(uctx, itemNumber);
      } else {
        await uctx.reply('Пожалуйста, укажите номер контента. Например: /content 1');
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

    tgBot.command('help', async (ctx) => {
      await helpCommand((ctx as any).uctx);
    });

    tgBot.command('list_users', async (ctx) => {
      await listUsersCommand((ctx as any).uctx);
    });

    tgBot.command('link_bot', async (ctx) => {
      await linkBotCommand((ctx as any).uctx);
    });

    tgBot.command('settings', async (ctx) => {
      const uctx = (ctx as any).uctx;
      const universalKeyboard = createUniversalSettingsKeyboard(uctx.platform, uctx.isAdmin);
      await uctx.reply(
        uctx.platform === 'telegram' ? escapeMarkdownV2('⚙️ Меню настроек:') : '⚙️ Меню настроек:',
        {
          telegramReplyMarkup: createTelegramKeyboard(universalKeyboard),
        },
      );
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
    tgBot.hears('Настройки ⚙️', async (ctx) => {
      const uctx = (ctx as any).uctx;
      const universalKeyboard = createUniversalSettingsKeyboard(uctx.platform, uctx.isAdmin);
      await uctx.reply(
        uctx.platform === 'telegram' ? escapeMarkdownV2('⚙️ Меню настроек:') : '⚙️ Меню настроек:',
        {
          telegramReplyMarkup: createTelegramKeyboard(universalKeyboard),
        },
      );
    });
    tgBot.hears('Мой ID 🆔', async (ctx) => {
      await idCommand((ctx as any).uctx);
    });
    tgBot.hears('Справка ❓', async (ctx) => {
      await helpCommand((ctx as any).uctx);
    });
    tgBot.hears('Другой бот 🔗', async (ctx) => {
      await linkBotCommand((ctx as any).uctx);
    });
    tgBot.hears('Стоп 🛑', async (ctx) => {
      await stopCommand((ctx as any).uctx);
    });
    tgBot.hears('Бэкап БД 💾', async (ctx) => {
      await backupDbCommand((ctx as any).uctx);
    });
    tgBot.hears('Список пользователей 👥', async (ctx) => {
      await listUsersCommand((ctx as any).uctx);
    });
    tgBot.hears('◀️ Назад', async (ctx) => {
      await startCommand((ctx as any).uctx);
    });

    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      tgBot.start();
      console.log('🚀 Telegram bot started with long polling');
    }
  } catch (error) {
    console.error('❌ Failed to start Telegram bot:', error);
    console.log('⚠️ Telegram is unavailable, continuing without it...');
  }
} else {
  console.log('⚠️ TELEGRAM_BOT_TOKEN not set, skipping Telegram bot');
}

// ─── VK Bot ──────────────────────────────────────────────────────────────────
if (vkBot) {
  // Используем глобальный vkBot
  try {
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
        userId: String(ctx.userId),
        peerId: ctx.peerId,
        text,
        isAdmin: ctx.userId === Number(VK_ADMIN_ID),
        db,
        reply: async (msg, extra) => {
          let vkKeyboardJson: string | undefined;
          if (extra?.remove_keyboard) {
            vkKeyboardJson = JSON.stringify({ buttons: [] }); // Явно убираем клавиатуру для VK
          } else if (extra?.vkKeyboard) {
            vkKeyboardJson = extra.vkKeyboard;
          }
          await vkBot.sendMessage(ctx.peerId, msg, vkKeyboardJson);
        },
        replyWithPhoto: async (photoUrl: string, caption?: string) => {
          try {
            await vkBot.sendMessage(ctx.peerId, caption || '', undefined, photoUrl);
          } catch (error) {
            console.error('VK replyWithPhoto error:', error);
            await vkBot.sendMessage(
              ctx.peerId,
              `${caption || ''}\n\n[📷 Смотреть изображение](${photoUrl})`,
            );
          }
        },
      };

      const commandToExecute = payloadCommand || text;

      const isStart =
        commandToExecute === '/start' ||
        commandToExecute === '🚀 Запустить бота и показать основное меню';

      if (!isStart) {
        const exists = await userExists('vk', uctx.userId); // Используем uctx.userId
        console.log(
          `[VK Guard] User ${uctx.userId} exists: ${exists}. Command: ${commandToExecute}`,
        );
        if (!exists) {
          console.log(
            `[VK Guard] User ${uctx.userId} does not exist. Blocking command: ${commandToExecute}`,
          );
          return;
        }
      }

      if (isStart) {
        await startCommand(uctx);
        return;
      }
      if (
        commandToExecute === '/full'
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
        await uctx.reply('❌ Команда /backupdb доступна только в Telegram.');
        return;
      }
      if (commandToExecute === '/help' || commandToExecute === 'Справка ❓') {
        await helpCommand(uctx);
        return;
      }
      if (commandToExecute === '/list_users' || commandToExecute === 'Список пользователей 👥') {
        await listUsersCommand(uctx);
        return;
      }
      if (commandToExecute === '/link_bot' || commandToExecute === 'Другой бот 🔗') {
        await linkBotCommand(uctx);
        return;
      }
      if (commandToExecute === '/settings' || commandToExecute === 'Настройки ⚙️') {
        const universalKeyboard = createUniversalSettingsKeyboard(uctx.platform, uctx.isAdmin);
        await uctx.reply(
          uctx.platform === 'telegram'
            ? escapeMarkdownV2('⚙️ Меню настроек:')
            : '⚙️ Меню настроек:',
          {
            vkKeyboard: createVKKeyboard(universalKeyboard),
          },
        );
        return;
      }
      if (commandToExecute === '◀️ Назад') {
        await startCommand(uctx);
        return;
      }

      // Если команда не распознана, показываем базовую клавиатуру
      await uctx.reply('❓ Неизвестная команда', {
        vkKeyboard: createVKKeyboard(createUniversalKeyboard('vk', false)),
      });
    });

    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      vkBot.start();
      console.log('🚀 VK bot started with long polling');
    } else {
      console.log('🚀 VK bot initialized (webhook mode)');
    }
  } catch (error) {
    console.error('❌ Failed to start VK bot:', error);
    console.log('⚠️ VK is unavailable, continuing without it...');
  }
} else {
  console.log('⚠️ VK_TOKEN or VK_GROUP_ID not set, skipping VK bot');
}
