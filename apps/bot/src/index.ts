import { InputFile } from 'grammy';
import {
  getSupabaseClient,
  createUniversalKeyboard,
  createVKKeyboard,
  findOrCreateUser,
  logCommand,
  type UniversalContext,
} from '@scope/shared';
import {
  createBot,
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
  adminCommand,
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
        firstName: ctx.from?.first_name,
        lastName: ctx.from?.last_name,
        username: ctx.from?.username,
        reply: async (text, extra) => {
          // Для Telegram, extra.telegramReplyMarkup должен быть объектом
          await ctx.reply(text, {
            parse_mode: 'MarkdownV2',
            ...(extra?.telegramReplyMarkup && { reply_markup: extra.telegramReplyMarkup }),
            ...(extra?.remove_keyboard && { reply_markup: { remove_keyboard: true } }),
            ...(extra?.link_preview_options && {
              link_preview_options: extra.link_preview_options,
            }),
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

      const uctx: UniversalContext = (ctx as any).uctx;
      if (!uctx) {
        console.error(`[TG Guard] uctx is undefined for user ${ctx.from?.id}. Skipping guard.`);
        return next();
      }

      const dbUser = await findOrCreateUser(uctx.platform, uctx.userId);

      if (!dbUser) {
        console.error(`[TG Guard] Failed to find or create user ${uctx.userId}. Blocking.`);
        return;
      }

      // Прикрепляем внутренний ID пользователя к контексту для логирования
      uctx.dbUserId = dbUser.id;

      if (isStart) {
        console.log(`[TG Guard] User ${uctx.userId} is calling /start. Proceeding.`);
        await logCommand(dbUser.id, uctx.platform, '/start');
        return next();
      }

      // Если пользователь не найден/создан (что не должно произойти, если findOrCreateUser отработал)
      if (!dbUser) {
        console.log(`[TG Guard] User ${uctx.userId} does not exist. Blocking command: ${text}`);
        return;
      }

      console.log(`[TG Guard] User ${uctx.userId} exists. Command: ${text}`);
      const command = text.split(' ')[0];
      if (command.startsWith('/')) {
        await logCommand(dbUser.id, uctx.platform, command);
      } else {
        await logCommand(dbUser.id, uctx.platform, text);
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

    tgBot.hears(/^\/content_(\d+)$/i, async (ctx) => {
      const itemNumber = parseInt(ctx.match[1], 10); // ctx.match[1] будет захваченным числом
      const uctx = (ctx as any).uctx;
      if (!isNaN(itemNumber) && itemNumber > 0) {
        await contentCommand(uctx, itemNumber);
      } else {
        await uctx.reply(
          escapeMarkdownV2('Пожалуйста, укажите корректный номер контента. Например: /content_1'),
        );
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

    tgBot.command('admin', async (ctx) => {
      await adminCommand((ctx as any).uctx);
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
    tgBot.hears('Справка ❓', async (ctx) => {
      await helpCommand((ctx as any).uctx);
    });
    tgBot.hears('Админ 👑', async (ctx) => {
      await adminCommand((ctx as any).uctx);
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

      // --- VK: Получаем данные пользователя ---
      let vkFirstName: string | undefined;
      let vkLastName: string | undefined;
      let vkUsername: string | undefined;

      try {
        const usersGetResult = await vkBot.request('users.get', {
          user_ids: ctx.userId,
          fields: 'first_name,last_name,screen_name',
        });
        if (Array.isArray(usersGetResult) && usersGetResult.length > 0) {
          const vkUser = usersGetResult[0] as {
            first_name: string;
            last_name?: string;
            screen_name?: string;
          };
          vkFirstName = vkUser.first_name;
          vkLastName = vkUser.last_name;
          vkUsername = vkUser.screen_name;
        }
      } catch (vkErr) {
        console.error(`[VK Bot] Error fetching user details for ${ctx.userId}:`, vkErr);
      }
      // --- Конец VK: Получаем данные пользователя ---

      const uctx: UniversalContext = {
        platform: 'vk',
        userId: String(ctx.userId),
        peerId: ctx.peerId,
        text,
        isAdmin: ctx.userId === Number(VK_ADMIN_ID),
        db,
        firstName: vkFirstName,
        lastName: vkLastName,
        username: vkUsername,
        reply: async (msg, extra) => {
          let vkKeyboardJson: string | undefined;
          if (extra?.remove_keyboard) {
            vkKeyboardJson = JSON.stringify({ buttons: [] });
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

      const dbUser = await findOrCreateUser(uctx.platform, uctx.userId);

      if (!dbUser) {
        console.error(`[VK Guard] Failed to find or create user ${uctx.userId}. Blocking.`);
        return;
      }

      uctx.dbUserId = dbUser.id;

      if (!isStart) {
        if (!dbUser) {
          console.log(
            `[VK Guard] User ${uctx.userId} does not exist. Blocking command: ${commandToExecute}`,
          );
          return;
        }
      }

      console.log(
        `[VK Guard] User ${uctx.userId} exists: ${!!dbUser}. Command: ${commandToExecute}`,
      );

      await logCommand(dbUser.id, uctx.platform, commandToExecute);

      if (isStart) {
        await startCommand(uctx);
        return;
      }
      if (commandToExecute === '/full') {
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
      const contentMatch = commandToExecute.match(/^\/content_(\d+)$/i);
      if (contentMatch) {
        const itemNumber = parseInt(contentMatch[1], 10);
        if (!isNaN(itemNumber) && itemNumber > 0) {
          await contentCommand(uctx, itemNumber);
        } else {
          await uctx.reply('Пожалуйста, укажите корректный номер контента. Например: /content_1');
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
      if (commandToExecute === '/admin' || commandToExecute === 'Админ 👑') {
        await adminCommand(uctx);
        return;
      }
      if (commandToExecute === '◀️ Назад') {
        await startCommand(uctx);
        return;
      }

      // Если команда не распознана, показываем базовую клавиатуру
      await uctx.reply('❓ Неизвестная команда', {
        vkKeyboard: createVKKeyboard(createUniversalKeyboard('vk', false, uctx.isAdmin)),
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
