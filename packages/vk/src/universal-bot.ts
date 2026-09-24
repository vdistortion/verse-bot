import path from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import {
  createAuthMiddleware,
  createLoggingMiddleware,
  dispatchUniversalCommand,
  type RichMessage,
  type BotDatabase,
  type UniversalAdminCheck,
  type UniversalCallbackContext,
  type UniversalContext,
  type UniversalEditOptions,
  type UniversalReplyOptions,
  type UserProfile,
} from '@verse-bot/core';
import { createVKKeyboard, createVKInlineKeyboard } from './keyboards.js';
import { VK_PEER_CHAT_OFFSET, VK_MAX_RANDOM_ID } from './vk-constants.js';
import { createVKBot, type VKBot } from './bot-factory.js';
import { renderRich } from './render-rich.js';

export interface VKBotConfig {
  token: string;
  userToken?: string;
  groupId: number;
  adminId?: number;
  /** Optional asynchronous check for VK community roles or extra administrators. */
  checkAdmin?: UniversalAdminCheck;
  database?: BotDatabase;
  commands: Record<string, (ctx: UniversalContext) => Promise<void>>;
  buttons: { command: string; label: string }[];
  /** Handler for normalized callback data; the original VK payload is available on ctx.payload. */
  onCallback?: (ctx: UniversalContext, payload: string) => Promise<void>;
  /** Fallback for incoming messages not handled by registered commands or buttons. */
  onMessage?: (ctx: UniversalContext) => Promise<void>;
  contentCommand?: (ctx: UniversalContext, itemNumber: number) => Promise<void>;
  userLogCommand?: (ctx: UniversalContext, userId: number) => Promise<void>;
  contentDir?: string;
  onReplyWithPhoto?: (
    ctx: UniversalContext,
    photoUrl: string,
    caption?: string,
    extra?: UniversalReplyOptions,
  ) => Promise<void>;
  unknownCommandPhrase?: (ctx: UniversalContext) => RichMessage;
  getButtonsForUnknown?: () => { label: string; command: string }[];
}

function renderVKMessage(message?: RichMessage): string | undefined {
  if (message === undefined) return undefined;
  return typeof message === 'string' ? message : renderRich(message);
}

function createVKSendOptions(options?: UniversalReplyOptions): {
  keyboard?: string;
  dont_parse_links?: boolean;
} {
  let keyboard: string | undefined;
  if (options?.remove_keyboard) {
    keyboard = createVKKeyboard([], true);
  } else if (options?.inlineKeyboard) {
    keyboard = createVKInlineKeyboard(options.inlineKeyboard);
  } else if (options?.replyKeyboard) {
    keyboard = createVKKeyboard(options.replyKeyboard, options.one_time);
  }

  return {
    keyboard,
    dont_parse_links: options?.link_preview_options?.is_disabled,
  };
}

export function getVKCallbackCommand(payload: unknown): string | undefined {
  if (typeof payload === 'string') {
    const value = payload.trim();
    if (!value) return undefined;

    try {
      const parsed = JSON.parse(value) as unknown;
      return parsed && typeof parsed === 'object' ? getVKCallbackCommand(parsed) : value;
    } catch {
      return value;
    }
  }

  if (payload && typeof payload === 'object' && 'command' in payload) {
    const command = payload.command;
    return typeof command === 'string' && command.trim() ? command.trim() : undefined;
  }

  if (payload && typeof payload === 'object' && 'callbackData' in payload) {
    const callbackData = payload.callbackData;
    return typeof callbackData === 'string' && callbackData.trim()
      ? callbackData.trim()
      : undefined;
  }

  return undefined;
}

export function getVKCallbackData(payload: unknown): string {
  if (typeof payload === 'string') {
    return getVKCallbackCommand(payload) ?? payload;
  }

  const command = getVKCallbackCommand(payload);
  if (command) return command;
  if (payload === undefined) return '';
  return JSON.stringify(payload) ?? String(payload);
}

interface VKMessageSource {
  userId: number;
  peerId: number;
  isChat: boolean;
  text: string;
  payload?: unknown;
  send: (
    text: string,
    options?: {
      keyboard?: string;
      attachment?: string;
      random_id?: number;
      dont_parse_links?: boolean;
    },
  ) => Promise<unknown>;
}

function createUniversalContext(
  config: VKBotConfig,
  vk: VKBot,
  source: VKMessageSource,
): UniversalContext {
  const uctx: UniversalContext = {
    platform: 'vk',
    userId: String(source.userId),
    peerId: source.peerId,
    text: source.text,
    payload: source.payload,
    isAdmin: source.userId === config.adminId,
    chatType: source.isChat ? 'group' : 'private',
    chatTitle: source.isChat ? 'Беседа' : undefined,
    db: config.database?.client,
    platformApi: vk,

    getUserProfile: async (): Promise<UserProfile | null> => {
      const [user] = await vk.api.users.get({ user_ids: [source.userId] });
      if (!user) return null;
      return {
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.screen_name,
      };
    },

    reply: async (replyText: RichMessage, options?: UniversalReplyOptions) => {
      const textToSend = typeof replyText === 'string' ? replyText : renderRich(replyText);

      await source.send(textToSend, {
        ...createVKSendOptions(options),
        random_id: Math.floor(Math.random() * VK_MAX_RANDOM_ID),
      });
    },

    replySafe: async (replyText: RichMessage, options?: UniversalReplyOptions) => {
      const safeOptions = { ...options };
      if (uctx.chatType !== 'private') {
        delete safeOptions.replyKeyboard;
      }
      await uctx.reply(replyText, safeOptions);
    },

    replyWithPhoto: async (
      photoUrl: string,
      caption?: RichMessage,
      options?: UniversalReplyOptions,
    ) => {
      const captionText = renderVKMessage(caption);
      if (config.onReplyWithPhoto) {
        return config.onReplyWithPhoto(uctx, photoUrl, captionText, options);
      }

      const sendOptions = createVKSendOptions(options);

      if (/^photo-?\d+_\d+(?:_[a-z\d]+)?$/i.test(photoUrl)) {
        await source.send(captionText ?? '', {
          ...sendOptions,
          attachment: photoUrl,
          random_id: Math.floor(Math.random() * VK_MAX_RANDOM_ID),
        });
        return;
      }

      const uploadAndSend = async (
        stream: NodeJS.ReadableStream | Buffer,
        filename: string,
      ): Promise<void> => {
        const photo = await vk.upload.messagePhoto({
          peer_id: source.peerId,
          source: { value: stream, filename },
        });
        await source.send(captionText ?? '', {
          ...sendOptions,
          attachment: `photo${photo.ownerId}_${photo.id}`,
          random_id: Math.floor(Math.random() * VK_MAX_RANDOM_ID),
        });
      };

      if (config.contentDir) {
        try {
          const filename = decodeURIComponent(path.basename(new URL(photoUrl).pathname));
          const localPath = path.join(config.contentDir, filename);
          if (existsSync(localPath)) {
            console.log(`[VK replyWithPhoto] local: ${localPath}`);
            await uploadAndSend(createReadStream(localPath), filename);
            return;
          }
        } catch (err) {
          console.warn(
            '[VK replyWithPhoto] local upload failed:',
            err instanceof Error ? err.message : String(err),
          );
        }
      }

      try {
        const filename = path.basename(new URL(photoUrl).pathname) || 'photo.jpg';
        console.log(`[VK replyWithPhoto] url: ${photoUrl}`);

        const res = await fetch(photoUrl, {
          headers: { 'User-Agent': 'VerseBot/1.0' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await uploadAndSend(Buffer.from(await res.arrayBuffer()), filename);
        return;
      } catch (err) {
        console.warn(
          '[VK replyWithPhoto] url upload failed:',
          err instanceof Error ? err.message : String(err),
        );
      }

      const fallbackText = [captionText, photoUrl].filter(Boolean).join('\n\n');
      await source.send(fallbackText || '📷', {
        ...sendOptions,
        random_id: Math.floor(Math.random() * VK_MAX_RANDOM_ID),
      });
    },
  };

  return uctx;
}

export function createUniversalVKBot(config: VKBotConfig): VKBot {
  const vk = createVKBot({
    token: config.token,
    userToken: config.userToken,
    groupId: config.groupId,
  });

  const buttonToCommand = new Map<string, string>();
  for (const { command, label } of config.buttons) {
    buttonToCommand.set(label, command);
  }

  const authMw = config.database ? createAuthMiddleware(config.database.persistence) : undefined;
  const logMw = config.database ? createLoggingMiddleware(config.database.persistence) : undefined;

  vk.on('message_new', async (vctx) => {
    console.log(`[${new Date().toISOString()}] VK @${vctx.userId}: ${vctx.text || '(no text)'}`);

    try {
      const ctx = vctx.update;
      if (ctx.type !== 'message') return;
      if (ctx.isOutbox || ctx.isGroup) return;

      let text = ctx.text?.trim() ?? '';
      if (text === 'Начать') text = '/start';

      const payload = ctx.messagePayload;
      if (payload?.command) {
        text = payload.command;
      }

      const isChat = ctx.peerId >= VK_PEER_CHAT_OFFSET;
      const uctx = createUniversalContext(config, vk, {
        userId: ctx.senderId,
        peerId: ctx.peerId,
        isChat,
        text,
        payload: ctx.hasMessagePayload ? ctx.messagePayload : undefined,
        send: (message, options) => ctx.send(message, options),
      });
      if (config.checkAdmin && !uctx.isAdmin) {
        uctx.isAdmin = await config.checkAdmin(uctx);
      }

      const runCommand = async () => {
        const commandToExecute = text.startsWith('/') ? text.slice(1) : buttonToCommand.get(text);

        const handled = await dispatchUniversalCommand(uctx, commandToExecute ?? text, config);
        if (!handled && config.onMessage) {
          await config.onMessage(uctx);
          return;
        }
        if (!handled && uctx.chatType === 'private' && config.unknownCommandPhrase) {
          const buttons = config.getButtonsForUnknown?.() ?? [];
          await uctx.reply(config.unknownCommandPhrase(uctx), {
            replyKeyboard: buttons.length > 0 ? [buttons] : undefined,
          });
        }
      };
      if (authMw) {
        await authMw(uctx, async () => {
          if (logMw) await logMw(uctx, runCommand);
          else await runCommand();
        });
      } else {
        await runCommand();
      }
    } catch (err) {
      console.error('[VK Bot] message_new handler error:', err);
    }
  });

  vk.on('message_event', async (vctx) => {
    const event = vctx.update;
    if (event.type !== 'message_event') return;
    const command = getVKCallbackCommand(event.eventPayload);
    const callbackData = getVKCallbackData(event.eventPayload);
    const text = command ?? '';
    const uctx = createUniversalContext(config, vk, {
      userId: event.userId,
      peerId: event.peerId,
      isChat: event.peerId >= VK_PEER_CHAT_OFFSET,
      text,
      payload: event.eventPayload,
      send: (message, options) => event.send(message, options),
    });

    let callbackAnswered = false;
    const callback: UniversalCallbackContext = {
      data: callbackData,
      messageId: event.conversationMessageId,
      answer: async (answerText) => {
        if (callbackAnswered) return;
        callbackAnswered = true;
        await event.answer({ type: 'show_snackbar', text: answerText ?? '' });
      },
      editMessage: async (message, options?: UniversalEditOptions) => {
        const keyboard = options?.inlineKeyboard
          ? createVKInlineKeyboard(options.inlineKeyboard)
          : undefined;
        await vk.api.messages.edit({
          peer_id: event.peerId,
          cmid: event.conversationMessageId,
          message: renderVKMessage(message) ?? '',
          keyboard,
          dont_parse_links: options?.link_preview_options?.is_disabled,
        });
      },
    };
    uctx.callback = callback;

    const runCommand = async () => {
      if (config.onCallback) {
        await config.onCallback(uctx, callbackData);
      } else if (command) {
        await dispatchUniversalCommand(uctx, command, config);
      }
    };

    try {
      if (config.checkAdmin && !uctx.isAdmin) {
        uctx.isAdmin = await config.checkAdmin(uctx);
      }
      if (authMw) {
        await authMw(uctx, async () => {
          if (logMw) await logMw(uctx, runCommand);
          else await runCommand();
        });
      } else {
        await runCommand();
      }
    } catch (err) {
      console.error('[VK Bot] message_event handler error:', err);
    } finally {
      try {
        await callback.answer();
      } catch (err) {
        console.error('[VK Bot] message_event answer error:', err);
      }
    }
  });

  return vk;
}
