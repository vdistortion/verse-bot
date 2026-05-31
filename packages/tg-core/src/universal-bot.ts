import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { Bot, InputFile } from 'grammy';
import {
  findOrCreateUser,
  format,
  logCommand,
  mdOpts,
  type UniversalContext,
} from '@verse-bot/shared';
import { createBot } from './bot-factory.js';
import { dbMiddleware } from './middleware/index.js';
import type { BotContext } from './types/index.js';

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
  onReplyWithPhoto?: (photoUrl: string, caption?: string) => Promise<void>;
  /** Путь к папке с контентом (для резервного поиска изображений). */
  contentDir?: string;
}

function makePhotoHandler(ctx: BotContext, contentDir?: string) {
  return async (photoUrl: string, caption?: string) => {
    try {
      await ctx.replyWithPhoto(photoUrl, {
        caption: caption ?? undefined,
        parse_mode: 'MarkdownV2',
      });
    } catch {
      const peerId = ctx.chat?.id ?? 0;
      if (contentDir) {
        const filename = decodeURIComponent(photoUrl.split('/').pop() ?? '');
        const filepath = path.join(contentDir, filename);
        if (existsSync(filepath)) {
          const buffer = readFileSync(filepath);
          await ctx.replyWithPhoto(new InputFile(buffer, filename), {
            caption: caption ?? undefined,
            parse_mode: 'MarkdownV2',
          });
        } else {
          await ctx.api.sendMessage(peerId, caption ?? '');
        }
      } else {
        await ctx.api.sendMessage(peerId, caption ?? '');
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
    const uctx: UniversalContext = {
      platform: 'telegram',
      userId: String(ctx.from?.id ?? 0),
      peerId: ctx.chat?.id ?? 0,
      text: ctx.message?.text ?? '',
      isAdmin: ctx.from?.id === config.adminId,
      db: ctx.db,
      firstName: ctx.from?.first_name,
      lastName: ctx.from?.last_name,
      username: ctx.from?.username,
      chatType: ctx.chat?.type ?? 'unknown',
      format: format('telegram'),
      replySafe: async (text, extra) => uctx.reply(text, { ...mdOpts('telegram'), ...extra }),
      reply: async (text, extra) => {
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
      replyWithPhoto: config.onReplyWithPhoto ?? makePhotoHandler(ctx, config.contentDir),
      tgApi: ctx.api,
    };
    (ctx as any).uctx = uctx;
    await next();
  });

  // Middleware проверки и логирования пользователей
  bot.use(async (ctx, next) => {
    const text = ctx.message?.text ?? '';
    const isStart = text === '/start' || text.startsWith('/start ') || text.startsWith('/start@');
    const uctx: UniversalContext = (ctx as any).uctx;
    if (!uctx) return next();

    // Если БД недоступна — пропускаем всю работу с пользователями
    if (!ctx.db) return next();

    const dbUser = await findOrCreateUser(uctx.platform, uctx.userId);
    if (!dbUser) return;
    uctx.dbUserId = dbUser.id;
    if (isStart) {
      await logCommand(dbUser!.id, uctx.platform, '/start');
      return next();
    }

    const command = text.split(' ')[0];
    const commandName = command.startsWith('/') ? command : text;
    await logCommand(dbUser!.id, uctx.platform, commandName);
    return next();
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
