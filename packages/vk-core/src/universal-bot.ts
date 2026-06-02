import { type Pool } from 'pg';
import {
  findOrCreateUser,
  format,
  logCommand,
  mdOpts,
  createVKKeyboard,
  createVKInlineKeyboard,
  userExists,
  type Platform,
  type UniversalContext,
  type UniversalReplyOptions,
} from '@verse-bot/shared';
import { VK_PEER_CHAT_OFFSET } from './vk-constants.js';
import { createVKBot, type VKBot } from './bot-factory.js';
import type { VKContext } from './types/index.js';

export interface VKBotConfig {
  token: string;
  groupId: number;
  adminId?: number;
  pool?: Pool;
  /** Обработчики команд (без слеша). Ключ – команда, например "start", "cat" */
  commands: Record<string, (ctx: UniversalContext) => Promise<void>>;
  /** Кнопки для регистрации. label – текст кнопки, command – команда (без слеша) */
  buttons: { command: string; label: string }[];
  /** Опциональный обработчик /content_ */
  contentCommand?: (ctx: UniversalContext, itemNumber: number) => Promise<void>;
  /** Опциональный обработчик /userlog_ */
  userLogCommand?: (ctx: UniversalContext, userId: number) => Promise<void>;
  /** Кастомный метод отправки фото */
  onReplyWithPhoto?: (
    ctx: UniversalContext,
    photoUrl: string,
    caption?: string,
    extra?: UniversalReplyOptions,
  ) => Promise<void>;
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

  // Общая логика обработки команды
  async function processCommand(ctx: VKContext, commandToExecute: string) {
    // Системная кнопка «Начать» в VK
    if (commandToExecute === 'Начать') {
      commandToExecute = '/start';
    }

    // Если текст – это кнопка, преобразуем в команду со слешем
    if (!commandToExecute.startsWith('/') && buttonToCommand.has(commandToExecute)) {
      commandToExecute = '/' + buttonToCommand.get(commandToExecute)!;
    }

    // --- БД: только если pool доступен ---
    let dbUserId: number | undefined;
    let vkFirstName: string | undefined;
    let vkLastName: string | undefined;
    let vkUsername: string | undefined;

    if (config.pool) {
      const isStart = commandToExecute.startsWith('/start');

      let dbUser;
      if (isStart) {
        // Для /start всегда создаём или обновляем пользователя
        dbUser = await findOrCreateUser('vk', String(ctx.userId));
      } else {
        // Для остальных команд проверяем существование, не создавая
        const exists = await userExists('vk', String(ctx.userId));
        if (!exists) {
          // Пользователь был удалён – молча выходим
          return;
        }
        // Получаем запись (чтобы обновить updated_at и получить id)
        dbUser = await findOrCreateUser('vk', String(ctx.userId));
      }

      if (!dbUser) {
        console.error(`Failed to find/create VK user ${ctx.userId}`);
        return;
      }
      dbUserId = dbUser.id;

      if (!isStart) {
        await logCommand(dbUser.id, 'vk', commandToExecute);
      }

      // users.get только для зарегистрированных пользователей с pool
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
    }
    // Если pool нет — пропускаем всю регистрацию/логирование,
    // обрабатываем команду для всех входящих

    // Формируем UniversalContext
    const uctx: UniversalContext = {
      platform: 'vk',
      userId: String(ctx.userId),
      peerId: ctx.peerId,
      text: commandToExecute,
      isAdmin: ctx.userId === Number(config.adminId),
      db: config.pool,
      dbUserId,
      vkApi: bot,
      firstName: vkFirstName,
      lastName: vkLastName,
      username: vkUsername,
      chatType: ctx.peerId > VK_PEER_CHAT_OFFSET ? 'group' : 'private',
      format: format('vk'),
      replySafe: async (text, extra) => uctx.reply(text, { ...mdOpts('vk'), ...extra }),
      reply: async (msg, extra) => {
        let vkKeyboardJson: string | undefined;
        if (extra?.remove_keyboard) {
          vkKeyboardJson = JSON.stringify({ buttons: [] });
        } else if (extra?.inlineKeyboard) {
          // Приоритет инлайн-клавиатуры для VK
          vkKeyboardJson = createVKInlineKeyboard(extra.inlineKeyboard);
        } else if (extra?.replyKeyboard) {
          vkKeyboardJson = createVKKeyboard(extra.replyKeyboard);
        }
        await bot.sendMessage(ctx.peerId, msg, vkKeyboardJson);
      },
      replyWithPhoto: config.onReplyWithPhoto
        ? (photoUrl, caption, extra) => config.onReplyWithPhoto!(uctx, photoUrl, caption, extra)
        : async (photoUrl, caption, extra) => {
            let vkKeyboardJson: string | undefined;
            if (extra?.inlineKeyboard) {
              // Приоритет инлайн-клавиатуры для VK
              vkKeyboardJson = createVKInlineKeyboard(extra.inlineKeyboard);
            } else if (extra?.replyKeyboard) {
              vkKeyboardJson = createVKKeyboard(extra.replyKeyboard);
            }
            try {
              // 1. Получаем URL загрузки фото от VK
              const uploadServer = (await bot.request('photos.getMessagesUploadServer', {
                peer_id: ctx.peerId,
              })) as { upload_url: string };

              // 2. Скачиваем изображение по URL
              const imageRes = await fetch(photoUrl);
              if (!imageRes.ok) throw new Error(`Image fetch failed: ${imageRes.status}`);
              const imageBytes = await imageRes.arrayBuffer();

              // 3. Загружаем на сервер VK (multipart/form-data)
              const filename = photoUrl.split('/').pop()?.split('?')[0] ?? 'photo.jpg';
              const formData = new FormData();
              formData.append('photo', new Blob([imageBytes]), filename);

              const uploadRes = await fetch(uploadServer.upload_url, {
                method: 'POST',
                body: formData,
              });
              const uploadData = (await uploadRes.json()) as {
                server: number;
                photo: string;
                hash: string;
              };

              // 4. Сохраняем фото в VK и получаем attachment-строку
              const saved = (await bot.request('photos.saveMessagesPhoto', {
                server: uploadData.server,
                photo: uploadData.photo,
                hash: uploadData.hash,
              })) as Array<{ owner_id: number; id: number }>;

              if (!saved.length) throw new Error('photos.saveMessagesPhoto returned empty array');

              const attachment = `photo${saved[0].owner_id}_${saved[0].id}`;
              await bot.sendMessage(ctx.peerId, caption ?? '', vkKeyboardJson, attachment);
            } catch (error) {
              console.error('[VK] replyWithPhoto error:', error);
              // Fallback: текст со ссылкой на изображение
              await bot.sendMessage(
                ctx.peerId,
                `${caption ?? ''}\n\n📷 ${photoUrl}`,
                vkKeyboardJson,
              );
            }
          },
    };

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
  }

  // Обработка новых сообщений (в том числе нажатий на инлайн-кнопки, которые теперь текстовые)
  bot.on('message_new', async (ctx: VKContext) => {
    let commandToExecute = ctx.text?.trim() ?? '';

    // Извлечение команды из payload (инлайн-кнопки передают команду в payload)
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

    await processCommand(ctx, commandToExecute);
  });

  return bot;
}
