import { type Pool } from 'pg';
import { createVKBot, type VKBot } from './bot-factory.js';
import type { VKContext } from './types';
import {
  findOrCreateUser,
  format,
  logCommand,
  userExists,
  mdOpts,
  createVKKeyboard,
  type Platform,
  type UniversalContext,
} from '@verse-bot/shared';

export interface VKBotConfig {
  token: string;
  groupId: number;
  adminId?: number;
  pool: Pool;
  /** Обработчики команд (без слеша). Ключ – команда, например "start", "cat" */
  commands: Record<string, (ctx: UniversalContext) => Promise<void>>;
  /** Кнопки для регистрации. label – текст кнопки, command – команда (без слеша) */
  buttons: { command: string; label: string }[];
  /** Опциональный обработчик /content_ */
  contentCommand?: (ctx: UniversalContext, itemNumber: number) => Promise<void>;
  /** Опциональный обработчик /userlog_ */
  userLogCommand?: (ctx: UniversalContext, userId: number) => Promise<void>;
  /** Кастомный метод отправки фото */
  onReplyWithPhoto?: (ctx: UniversalContext, photoUrl: string, caption?: string) => Promise<void>;
  /** Фраза для неизвестных команд (если нужно показывать клавиатуру) */
  unknownCommandPhrase?: (platform: Platform) => string;
  /** Функция получения кнопок для неизвестных команд (чтобы показать клавиатуру) */
  getButtonsForUnknown?: () => { label: string; command: string }[];
}

export function createUniversalVKBot(config: VKBotConfig): VKBot {
  const bot = createVKBot({ token: config.token, groupId: config.groupId });

  // Карта преобразования текстовых кнопок в команды
  const buttonToCommand = new Map<string, string>();
  for (const { command, label } of config.buttons) {
    buttonToCommand.set(label, command);
  }

  bot.on('message_new', async (ctx: VKContext) => {
    let commandToExecute = ctx.text?.trim() ?? '';

    // Извлечение команды из payload
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

    // Если текст – это кнопка, преобразуем в команду со слешем
    if (!commandToExecute.startsWith('/') && buttonToCommand.has(commandToExecute)) {
      commandToExecute = '/' + buttonToCommand.get(commandToExecute)!;
    }

    const isStart =
      commandToExecute === '/start' ||
      commandToExecute === 'Начать' ||
      commandToExecute === 'начать';

    // Проверка и создание пользователя
    const exists = await userExists('vk', String(ctx.userId));
    if (!exists) {
      if (isStart) {
        const dbUser = await findOrCreateUser('vk', String(ctx.userId));
        if (!dbUser) {
          console.error(`Failed to create VK user ${ctx.userId}`);
          return;
        }
        await logCommand(dbUser.id, 'vk', '/start');
      } else {
        return; // Игнорируем сообщения несуществующих пользователей
      }
    }

    // Получение данных пользователя VK
    let vkFirstName: string | undefined;
    let vkLastName: string | undefined;
    let vkUsername: string | undefined;
    try {
      const usersGetResult = await bot.request('users.get', {
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
      isAdmin: ctx.userId === Number(config.adminId),
      db: config.pool,
      vkApi: bot,
      firstName: vkFirstName,
      lastName: vkLastName,
      username: vkUsername,
      chatType: ctx.peerId > 2000000000 ? 'group' : 'private',
      format: format('vk'),
      replySafe: async (text, extra) => uctx.reply(text, { ...mdOpts('vk'), ...extra }),
      reply: async (msg, extra) => {
        let vkKeyboardJson: string | undefined;
        if (extra?.remove_keyboard) {
          vkKeyboardJson = JSON.stringify({ buttons: [] });
        } else if (extra?.vkKeyboard) {
          vkKeyboardJson = extra.vkKeyboard;
        }
        await bot.sendMessage(ctx.peerId, msg, vkKeyboardJson);
      },
      replyWithPhoto: config.onReplyWithPhoto
        ? (photoUrl, caption) => config.onReplyWithPhoto!(uctx, photoUrl, caption)
        : async (photoUrl, caption) => {
            // Дефолтная реализация: отправляем фото как вложение
            try {
              await bot.sendMessage(ctx.peerId, caption || '', undefined, photoUrl);
            } catch (error) {
              console.error('VK replyWithPhoto error:', error);
              await bot.sendMessage(
                ctx.peerId,
                `${caption || ''}\n\n[📷 Смотреть изображение](${photoUrl})`,
              );
            }
          },
    };

    // Получаем dbUserId
    const dbUser = await findOrCreateUser('vk', String(ctx.userId));
    uctx.dbUserId = dbUser?.id;

    // Логирование (если не /start, который уже залогирован)
    if (exists && !isStart) {
      await logCommand(dbUser!.id, 'vk', commandToExecute);
    }

    // Выполнение команды
    const commandName = commandToExecute.startsWith('/')
      ? commandToExecute.slice(1)
      : commandToExecute;
    const handler = config.commands[commandName];
    if (handler) {
      await handler(uctx);
      return;
    }

    // Динамические команды
    const contentMatch = commandToExecute.match(/^\/content_(\d+)$/i);
    if (contentMatch && config.contentCommand) {
      const itemNumber = parseInt(contentMatch[1], 10);
      if (!isNaN(itemNumber) && itemNumber > 0) {
        await config.contentCommand(uctx, itemNumber);
        return;
      }
    }

    const userlogMatch = commandToExecute.match(/^\/userlog_(\d+)$/i);
    if (userlogMatch && config.userLogCommand) {
      const userId = parseInt(userlogMatch[1], 10);
      if (!isNaN(userId)) {
        await config.userLogCommand(uctx, userId);
        return;
      }
    }

    // Неизвестная команда
    if (config.unknownCommandPhrase && config.getButtonsForUnknown) {
      const phrase = config.unknownCommandPhrase('vk');
      const buttons = config.getButtonsForUnknown();
      const rows = [];
      for (let i = 0; i < buttons.length; i += 2) {
        rows.push(buttons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })));
      }
      await bot.sendMessage(ctx.peerId, phrase, createVKKeyboard(rows));
    }
  });

  return bot;
}
