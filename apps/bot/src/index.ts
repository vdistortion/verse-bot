import { InputFile } from 'grammy';
import {
  db,
  createVKKeyboard,
  findOrCreateUser,
  format,
  logCommand,
  type UniversalContext,
  userExists,
  mdOpts,
} from '@scope/shared';
import { createBot, dbMiddleware } from '@scope/tg-bot-core';
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
  statsCommand,
  userLogCommand,
  myLogCommand,
} from './commands';
import {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_ADMIN_ID,
  VK_GROUP_TOKEN,
  VK_GROUP_ID,
  VK_ADMIN_ID,
} from './env';
import { getButtons, phrases } from './locales/ru';

export const tgBot = TELEGRAM_BOT_TOKEN ? createBot({ token: TELEGRAM_BOT_TOKEN }) : null;
export const vkBot =
  VK_GROUP_TOKEN && VK_GROUP_ID
    ? createVKBot({
        token: VK_GROUP_TOKEN,
        groupId: Number(VK_GROUP_ID),
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
        chatType: ctx.chat?.type ?? 'unknown', // 'private', 'group', 'supergroup', 'channel'
        format: format('telegram'),
        replySafe: async (text, extra) => {
          return uctx.reply(text, { ...mdOpts('telegram'), ...extra });
        },
        reply: async (text, extra) => {
          // Для Telegram, extra.telegramReplyMarkup должен быть объектом
          await ctx.api.sendMessage(uctx.peerId, text, {
            ...(extra?.parse_mode && { parse_mode: extra.parse_mode }),
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
          try {
            await ctx.replyWithPhoto(photoUrl, {
              caption: caption ? caption : undefined,
              parse_mode: 'MarkdownV2',
            });
          } catch (err) {
            console.warn('Failed to send photo by URL, trying InputFile:', err);
            try {
              const response = await fetch(photoUrl);
              const buffer = Buffer.from(await response.arrayBuffer());
              const inputFile = new InputFile(buffer, 'image.webp');
              await ctx.replyWithPhoto(inputFile, {
                caption: caption ? caption : undefined,
                parse_mode: 'MarkdownV2',
              });
            } catch (downloadErr) {
              console.error('InputFile fallback failed:', downloadErr);
              await ctx.api.sendMessage(uctx.peerId, caption ?? '');
            }
          }
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
      if (!uctx) return next();

      const exists = await userExists(uctx.platform, uctx.userId);

      if (!exists) {
        if (isStart) {
          const dbUser = await findOrCreateUser(uctx.platform, uctx.userId);
          if (!dbUser) {
            console.error(`Failed to create user ${uctx.userId}`);
            return;
          }
          uctx.dbUserId = dbUser.id;
          await logCommand(dbUser.id, uctx.platform, '/start');
          return next();
        }

        return;
      }

      const dbUser = await findOrCreateUser(uctx.platform, uctx.userId); // вернёт существующего пользователя
      uctx.dbUserId = dbUser!.id;

      if (isStart) {
        await logCommand(dbUser!.id, uctx.platform, '/start');
        return next();
      }

      const command = text.split(' ')[0];
      if (command.startsWith('/')) {
        await logCommand(dbUser!.id, uctx.platform, command);
      } else {
        await logCommand(dbUser!.id, uctx.platform, text);
      }

      return next();
    });

    // Сопоставление команда -> обработчик
    const commandHandlers: Record<string, (uctx: UniversalContext) => Promise<void>> = {
      start: startCommand,
      full: fullCommand,
      cat: catCommand,
      quote: quoteCommand,
      advice: adviceCommand,
      random: randomCommand,
      help: helpCommand,
      stop: stopCommand,
      id: idCommand,
      mylog: myLogCommand,
      admin: adminCommand,
      backupdb: backupDbCommand,
      list_users: listUsersCommand,
      stats: statsCommand,
    };

    // Регистрируем команды и кнопки из phrases.commands
    for (const cmd of Object.values(phrases.commands)) {
      if (cmd.command === 'content' || cmd.command === 'userlog') continue;

      const handler = commandHandlers[cmd.command];
      if (handler) {
        tgBot.command(cmd.command, async (ctx) => {
          const uctx = (ctx as any).uctx;
          await handler(uctx);
        });
      }

      if (cmd.button) {
        tgBot.hears(cmd.button, async (ctx) => {
          const uctx = (ctx as any).uctx;
          await handler?.(uctx);
        });
      }
    }

    // Динамические команды
    tgBot.hears(/^\/content_(\d+)$/i, async (ctx) => {
      const itemNumber = parseInt(ctx.match[1], 10); // ctx.match[1] будет захваченным числом
      const uctx = (ctx as any).uctx;
      if (!isNaN(itemNumber) && itemNumber > 0) {
        await contentCommand(uctx, itemNumber);
      } else {
        await uctx.reply(phrases.content.invalidNumber(uctx.platform), {
          parse_mode: 'MarkdownV2',
        });
      }
    });

    tgBot.hears(/^\/userlog_(\d+)$/i, async (ctx) => {
      const userId = parseInt(ctx.match[1], 10);
      const uctx = (ctx as any).uctx;
      if (!isNaN(userId)) {
        await userLogCommand(uctx, userId);
      }
    });

    tgBot.start();
    console.log('🚀 Telegram bot started with long polling');
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
    // Сопоставление команда -> обработчик для VK
    const vkCommandHandlers: Record<string, (uctx: UniversalContext) => Promise<void>> = {
      '/start': startCommand,
      '/full': fullCommand,
      '/cat': catCommand,
      '/quote': quoteCommand,
      '/advice': adviceCommand,
      '/random': randomCommand,
      '/help': helpCommand,
      '/stop': stopCommand,
      '/id': idCommand,
      '/mylog': myLogCommand,
      '/admin': adminCommand,
      '/list_users': listUsersCommand,
      '/stats': statsCommand,
    };

    // Карта кнопок -> команды
    const buttonToCommand: Record<string, string> = {};
    for (const cmd of Object.values(phrases.commands)) {
      if (cmd.button) {
        buttonToCommand[cmd.button] = '/' + cmd.command;
      }
    }

    vkBot.on('message_new', async (ctx: VKContext) => {
      const text = ctx.text?.trim() ?? '';
      let commandToExecute = text;

      // Извлечение команды из payload кнопки
      if (ctx.payload) {
        try {
          const parsedPayload = JSON.parse(ctx.payload);
          if (parsedPayload.command) {
            commandToExecute = parsedPayload.command;
          }
        } catch (e) {
          console.warn('Failed to parse VK payload:', e);
        }
      }

      // Если текст – это кнопка, преобразуем в команду
      if (!commandToExecute.startsWith('/') && buttonToCommand[commandToExecute]) {
        commandToExecute = buttonToCommand[commandToExecute];
      }

      const isStart =
        commandToExecute === '/start' ||
        commandToExecute === '🚀 Запустить бота и показать основное меню';

      // Проверка существования пользователя
      const exists = await userExists('vk', String(ctx.userId));

      if (!exists) {
        // Разрешаем только /start
        if (isStart) {
          // Создаём пользователя
          const dbUser = await findOrCreateUser('vk', String(ctx.userId));
          if (!dbUser) {
            console.error(`Failed to create VK user ${ctx.userId}`);
            return; // можно ответить ошибкой, но пока просто молчим
          }
          await logCommand(dbUser.id, 'vk', '/start');
        } else {
          return; // Игнорируем сообщения несуществующих пользователей
        }
      }

      // Если мы здесь, то либо пользователь существовал, либо только что создан
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

      // Формируем UniversalContext
      const uctx: UniversalContext = {
        platform: 'vk',
        userId: String(ctx.userId),
        peerId: ctx.peerId,
        text: commandToExecute,
        isAdmin: ctx.userId === Number(VK_ADMIN_ID),
        db: db(),
        firstName: vkFirstName,
        lastName: vkLastName,
        username: vkUsername,
        chatType: ctx.peerId > 2000000000 ? 'group' : 'private', // 2e9 – порог ID беседы
        format: format('vk'),
        replySafe: async (text, extra) => {
          return uctx.reply(text, { ...mdOpts('vk'), ...extra });
        },
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

      // Получаем dbUserId (если пользователь новосозданный, он уже есть в findOrCreateUser, но здесь перестрахуемся)
      const dbUser = await findOrCreateUser('vk', String(ctx.userId));
      uctx.dbUserId = dbUser?.id;

      // Логируем команду (если не /start, т.к. он уже залогирован выше)
      if (exists && !isStart) {
        await logCommand(dbUser!.id, 'vk', commandToExecute);
      }

      // Выполняем команду
      const handler = vkCommandHandlers[commandToExecute];
      if (handler) {
        await handler(uctx);
        return;
      }

      // Динамические команды /content_ и /userlog_
      const contentMatch = commandToExecute.match(/^\/content_(\d+)$/i);
      if (contentMatch) {
        const itemNumber = parseInt(contentMatch[1], 10);
        if (!isNaN(itemNumber) && itemNumber > 0) {
          await contentCommand(uctx, itemNumber);
          return;
        }
      }

      const userlogMatch = commandToExecute.match(/^\/userlog_(\d+)$/i);
      if (userlogMatch) {
        const userId = parseInt(userlogMatch[1], 10);
        if (!isNaN(userId)) {
          await userLogCommand(uctx, userId);
          return;
        }
      }
      // Если команда не распознана, показываем базовую клавиатуру
      const buttons = getButtons(false);
      const rows = [];
      for (let i = 0; i < buttons.length; i += 2) {
        rows.push(buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })));
      }
      await vkBot.sendMessage(ctx.peerId, phrases.unknownCommand('vk'), createVKKeyboard(rows));
    });

    vkBot.start();
    console.log('🚀 VK bot started with long polling');
  } catch (error) {
    console.error('❌ Failed to start VK bot:', error);
    console.log('⚠️ VK is unavailable, continuing without it...');
  }
} else {
  console.log('⚠️ VK_GROUP_TOKEN or VK_GROUP_ID not set, skipping VK bot');
}
