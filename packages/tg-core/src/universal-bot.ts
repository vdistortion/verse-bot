import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { Bot, InputFile } from 'grammy';
import {
  createAuthMiddleware,
  createLoggingMiddleware,
  type Platform,
  type UniversalContext,
  type UniversalReplyOptions,
} from '@verse-bot/core';
import { findOrCreateUser, userExists, logCommand } from '@verse-bot/db';
import { format, mdOpts } from '@verse-bot/format';
import { createBot } from './bot-factory.js';
import { dbMiddleware } from './middleware/index.js';
import type { BotContext } from './types/index.js';
import { createTelegramKeyboard, createTelegramInlineKeyboard } from './keyboards/index.js';

export interface TelegramBotConfig {
  token: string;
  adminId?: number;
  /** Обработчики статических команд (без параметров). Ключ – имя команды (без слеша). */
  commands: Record<string, (ctx: UniversalContext) => Promise<void>>;
  /** Определения кнопок (берутся из phrases). Массив объектов с command и button. */
  buttons: { command: string; label: string }[];
  /** Опционально: обработчик команды /content_<N> */
  contentCommand?: (ctx: UniversalContext, itemNumber: number) => Promise<void>;
  /** Опционально: обработчик команды /userlog_<N> */
  userLogCommand?: (ctx: UniversalContext, userId: number) => Promise<void>;
  /** Опциональный кастомный обработчик отправки фото (используется в replyWithPhoto контекста).
   *  Если не задан, используется ctx.replyWithPhoto из GrammY. */
  onReplyWithPhoto?: (
    photoUrl: string,
    caption?: string,
    extra?: UniversalReplyOptions,
  ) => Promise<void>;
  /** Путь к папке с контентом (для резервного поиска изображений). */
  contentDir?: string;
  unknownCommandPhrase?: (platform: Platform) => string;
}

function makePhotoHandler(ctx: BotContext, contentDir?: string) {
  return async (photoUrl: string, caption?: string, extra?: UniversalReplyOptions) => {
    const telegramExtra: any = {
      caption: caption ?? undefined,
      parse_mode: 'MarkdownV2',
    };

    // Приоритет инлайн-клавиатуры, если она присутствует
    if (extra?.inlineKeyboard) {
      telegramExtra.reply_markup = createTelegramInlineKeyboard(extra.inlineKeyboard);
    } else if (extra?.replyKeyboard) {
      telegramExtra.reply_markup = createTelegramKeyboard(extra.replyKeyboard);
    }

    try {
      await ctx.replyWithPhoto(photoUrl, telegramExtra);
    } catch {
      const peerId = ctx.chat?.id ?? 0;
      if (contentDir) {
        const filename = decodeURIComponent(photoUrl.split('/').pop() ?? '');
        const filepath = path.join(contentDir, filename);
        if (existsSync(filepath)) {
          const buffer = readFileSync(filepath);
          await ctx.replyWithPhoto(new InputFile(buffer, filename), telegramExtra);
        } else {
          await ctx.api.sendMessage(peerId, caption ?? '', telegramExtra);
        }
      } else {
        await ctx.api.sendMessage(peerId, caption ?? '', telegramExtra);
      }
    }
  };
}

export function createUniversalTelegramBot(config: TelegramBotConfig): Bot<BotContext> {
  const bot = createBot({ token: config.token });

  // Подключаем пул БД
  bot.use(dbMiddleware);

  // Middleware создания UniversalContext
  bot.use(async (ctx, next) => {
    const fromId = ctx.from?.id ?? 0;
    const chatId = ctx.chat?.id ?? ctx.callbackQuery?.message?.chat.id ?? 0;
    const chatType = ctx.chat?.type ?? ctx.callbackQuery?.message?.chat.type ?? 'unknown';
    const messageText = ctx.message?.text ?? ctx.callbackQuery?.data ?? '';

    const uctx: UniversalContext = {
      platform: 'telegram',
      userId: String(fromId),
      peerId: chatId,
      text: messageText,
      isAdmin: fromId === config.adminId,
      db: ctx.db,
      platformApi: ctx.api,
      chatTitle: ctx.chat?.title,
      chatType: chatType,
      format: format('telegram'),
      replySafe: async (text: string, extra?: UniversalReplyOptions) =>
        uctx.reply(text, { ...mdOpts('telegram'), ...extra }),
      reply: async (text: string, extra?: UniversalReplyOptions) => {
        const telegramExtra: any = {
          ...(extra?.parse_mode && { parse_mode: extra.parse_mode }),
          ...(extra?.link_preview_options && {
            link_preview_options: extra.link_preview_options,
          }),
        };

        if (extra?.remove_keyboard) {
          telegramExtra.reply_markup = { remove_keyboard: true };
        } else if (extra?.inlineKeyboard) {
          // Приоритет инлайн-клавиатуры
          telegramExtra.reply_markup = createTelegramInlineKeyboard(extra.inlineKeyboard);
        } else if (extra?.replyKeyboard) {
          telegramExtra.reply_markup = createTelegramKeyboard(extra.replyKeyboard);
        }

        await ctx.api.sendMessage(uctx.peerId, text, telegramExtra);
      },
      replyWithFile: async (
        buffer: Buffer,
        filename: string,
        caption?: string,
        extra?: UniversalReplyOptions,
      ) => {
        const telegramExtra: any = {
          caption,
          parse_mode: 'MarkdownV2',
        };
        if (extra?.inlineKeyboard) {
          // Приоритет инлайн-клавиатуры
          telegramExtra.reply_markup = createTelegramInlineKeyboard(extra.inlineKeyboard);
        } else if (extra?.replyKeyboard) {
          telegramExtra.reply_markup = createTelegramKeyboard(extra.replyKeyboard);
        }
        await ctx.replyWithDocument(new InputFile(buffer, filename), telegramExtra);
      },
      replyWithPhoto: config.onReplyWithPhoto
        ? (photoUrl: string, caption?: string, extra?: UniversalReplyOptions) =>
            config.onReplyWithPhoto!(photoUrl, caption, extra)
        : (photoUrl: string, caption?: string, extra?: UniversalReplyOptions) =>
            makePhotoHandler(ctx, config.contentDir)(photoUrl, caption, extra),
      getUserProfile: async () => {
        try {
          const chat = await ctx.api.getChat(fromId);
          return {
            firstName: chat.first_name ?? 'Unknown',
            lastName: chat.last_name,
            username: chat.username,
          };
        } catch {
          return null;
        }
      },
    };
    (ctx as any).uctx = uctx;
    await next();
  });

  const authMw = createAuthMiddleware({ findOrCreateUser, userExists });
  const logMw = createLoggingMiddleware({ logCommand });

  bot.use(async (ctx, next) => {
    const uctx = (ctx as any).uctx as UniversalContext;
    if (!uctx) return next();
    await authMw(uctx, next);
  });
  bot.use(async (ctx, next) => {
    const uctx = (ctx as any).uctx as UniversalContext;
    if (!uctx) return next();
    await logMw(uctx, next);
  });

  bot.on('callback_query:data', async (ctx) => {
    const uctx: UniversalContext = (ctx as any).uctx;
    if (!uctx) {
      await ctx.answerCallbackQuery();
      return;
    }

    try {
      const callbackData = ctx.callbackQuery.data;
      const commandName = callbackData.startsWith('/') ? callbackData.slice(1) : callbackData;

      const handler = config.commands[commandName];
      if (handler) {
        if (uctx.dbUserId) {
          await logCommand(uctx.dbUserId, 'telegram', commandName);
        }
        await handler(uctx);
      } else {
        const contentMatch = commandName.match(/^content_(\d+)$/i);
        if (contentMatch && config.contentCommand) {
          const itemNumber = parseInt(contentMatch[1], 10);
          if (!isNaN(itemNumber) && itemNumber > 0) {
            if (uctx.dbUserId) {
              await logCommand(uctx.dbUserId, 'telegram', `content_${itemNumber}`);
            }
            await config.contentCommand(uctx, itemNumber);
          }
        } else if (commandName.startsWith('userlog_') && config.userLogCommand) {
          const userlogMatch = commandName.match(/^userlog_(\d+)$/i);
          if (userlogMatch) {
            const userId = parseInt(userlogMatch[1], 10);
            if (!isNaN(userId)) {
              if (uctx.dbUserId) {
                await logCommand(uctx.dbUserId, 'telegram', `userlog_${userId}`);
              }
              await config.userLogCommand(uctx, userId);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Telegram] callback_query handler error:', err);
    } finally {
      await ctx.answerCallbackQuery();
    }
  });

  // Регистрация статических команд и кнопок
  for (const { command, label } of config.buttons) {
    const handler = config.commands[command];
    if (handler) {
      // Команда вида /start
      bot.command(command, async (ctx) => {
        const uctx = (ctx as any).uctx;
        await handler(uctx);
      });
      // Кнопка с текстом label
      bot.hears(label, async (ctx) => {
        const uctx = (ctx as any).uctx;
        await handler(uctx);
      });
    }
  }

  // Регистрация остальных команд, которые не имеют кнопок (например, /full, /admin)
  for (const [command, handler] of Object.entries(config.commands)) {
    // Проверяем, не была ли уже зарегистрирована через кнопку
    const alreadyRegistered = config.buttons.some((b) => b.command === command);
    if (!alreadyRegistered) {
      bot.command(command, async (ctx) => {
        const uctx = (ctx as any).uctx;
        await handler(uctx);
      });
    }
  }

  // Обработка неизвестных команд (только в личных чатах)
  if (config.unknownCommandPhrase) {
    bot.on('message:text', async (ctx, next) => {
      const uctx = (ctx as any).uctx as UniversalContext | undefined;
      if (!uctx || uctx.chatType !== 'private') return next();

      const text = ctx.message?.text?.trim() ?? '';
      if (!text) return next();

      // Проверяем, не является ли сообщение известной командой (статической или динамической)
      const commandName = text.startsWith('/') ? text.slice(1).split(' ')[0] : text;
      if (config.commands[commandName]) return next(); // статическая команда
      if (/^\/?content_\d+$/i.test(commandName)) return next(); // content_
      if (/^\/?userlog_\d+$/i.test(commandName)) return next(); // userlog_
      // Игнорируем, если текст совпадает с label какой-то кнопки (уже обработано)
      if (config.buttons.some((b) => b.label === text)) return next();

      // Неизвестная команда – отвечаем фразой
      await uctx.reply(config.unknownCommandPhrase!(uctx.platform));
      await next();
    });
  }

  // Динамические команды
  if (config.contentCommand) {
    bot.hears(/^\/content_(\d+)$/i, async (ctx) => {
      const itemNumber = parseInt(ctx.match[1], 10);
      if (!isNaN(itemNumber) && itemNumber > 0) {
        const uctx = (ctx as any).uctx;
        await config.contentCommand!(uctx, itemNumber);
      } else {
        // Сообщение об ошибке? Можно передать фразу из phrases, но пока опустим
      }
    });
  }

  if (config.userLogCommand) {
    bot.hears(/^\/userlog_(\d+)$/i, async (ctx) => {
      const userId = parseInt(ctx.match[1], 10);
      if (!isNaN(userId)) {
        const uctx = (ctx as any).uctx;
        await config.userLogCommand!(uctx, userId);
      }
    });
  }

  return bot;
}
