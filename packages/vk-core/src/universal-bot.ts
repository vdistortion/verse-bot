import path from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import type { Pool } from 'pg';
import type { MessageContext } from 'vk-io';
import {
  createAuthMiddleware,
  createLoggingMiddleware,
  type RichMessage,
  type UniversalContext,
  type UniversalReplyOptions,
  type UserProfile,
} from '@verse-bot/core';
import { findOrCreateUser, userExists, logCommand } from '@verse-bot/db';
import { fmtRich } from 'tg-rich-messages';
import { createVKKeyboard, createVKInlineKeyboard } from './keyboards.js';
import { VK_PEER_CHAT_OFFSET, VK_MAX_RANDOM_ID } from './vk-constants.js';
import { createVKBot, type VKBot } from './bot-factory.js';
import { renderRich } from './render-rich.js';

export interface VKBotConfig {
  token: string;
  groupId: number;
  adminId?: number;
  pool?: Pool;
  commands: Record<string, (ctx: UniversalContext) => Promise<void>>;
  buttons: { command: string; label: string }[];
  contentCommand?: (ctx: UniversalContext, itemNumber: number) => Promise<void>;
  userLogCommand?: (ctx: UniversalContext, userId: number) => Promise<void>;
  contentDir?: string;
  onReplyWithPhoto?: (
    ctx: UniversalContext,
    photoUrl: string,
    caption?: string,
    extra?: UniversalReplyOptions,
  ) => Promise<void>;
  unknownCommandPhrase?: (format: typeof fmtRich) => RichMessage;
  getButtonsForUnknown?: () => { label: string; command: string }[];
}

function renderVKMessage(message?: RichMessage): string | undefined {
  if (message === undefined) return undefined;
  return typeof message === 'string' ? message : renderRich(message);
}

export function createUniversalVKBot(config: VKBotConfig): VKBot {
  const vk = createVKBot({
    token: config.token,
    groupId: config.groupId,
  });

  const buttonToCommand = new Map<string, string>();
  for (const { command, label } of config.buttons) {
    buttonToCommand.set(label, command);
  }

  const authMw = createAuthMiddleware({ findOrCreateUser, userExists });
  const logMw = createLoggingMiddleware({ logCommand });

  vk.on('message_new', async (vctx) => {
    console.log(`[${new Date().toISOString()}] VK @${vctx.userId}: ${vctx.text || '(no text)'}`);

    try {
      const ctx = vctx.update as unknown as MessageContext;
      if (ctx.isOutbox || ctx.isGroup) return;

      let text = ctx.text?.trim() ?? '';
      if (text === 'Начать') text = '/start';

      const payload = ctx.messagePayload;
      if (payload?.command) {
        text = payload.command;
      }

      const isChat = ctx.peerId >= VK_PEER_CHAT_OFFSET;

      const uctx: UniversalContext = {
        platform: 'vk',
        userId: String(ctx.senderId),
        peerId: ctx.peerId,
        text,
        isAdmin: ctx.senderId === config.adminId,
        chatType: isChat ? 'group' : 'private',
        chatTitle: isChat ? 'Беседа' : undefined,
        db: config.pool,
        platformApi: vk,
        format: fmtRich,

        getUserProfile: async (): Promise<UserProfile | null> => {
          const [user] = await vk.api.users.get({ user_ids: [ctx.senderId] });
          if (!user) return null;
          return {
            firstName: user.first_name,
            lastName: user.last_name,
          };
        },

        reply: async (replyText: RichMessage, options?: UniversalReplyOptions) => {
          let keyboard: string | undefined;
          if (options?.replyKeyboard) {
            keyboard = createVKKeyboard(options.replyKeyboard, options.one_time);
          } else if (options?.inlineKeyboard) {
            keyboard = createVKInlineKeyboard(options.inlineKeyboard);
          }

          const textToSend = typeof replyText === 'string' ? replyText : renderRich(replyText);

          await ctx.send(textToSend, {
            keyboard,
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

          let keyboard: string | undefined;
          if (options?.inlineKeyboard) {
            keyboard = createVKInlineKeyboard(options.inlineKeyboard);
          } else if (options?.replyKeyboard) {
            keyboard = createVKKeyboard(options.replyKeyboard);
          }

          const uploadAndSend = async (
            stream: NodeJS.ReadableStream | Buffer,
            filename: string,
          ): Promise<void> => {
            const photo = await vk.upload.messagePhoto({
              peer_id: ctx.peerId,
              source: { value: stream, filename },
            });
            await ctx.send(captionText ?? '', {
              attachment: `photo${photo.ownerId}_${photo.id}`,
              keyboard,
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
            } catch (err: any) {
              console.warn('[VK replyWithPhoto] local upload failed:', err.message);
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
          } catch (err: any) {
            console.warn('[VK replyWithPhoto] url upload failed:', err.message);
          }

          const fallbackText = [captionText, photoUrl].filter(Boolean).join('\n\n');
          await ctx.send(fallbackText || '📷', {
            keyboard,
            random_id: Math.floor(Math.random() * VK_MAX_RANDOM_ID),
          });
        },
      };

      await authMw(uctx, async () => {
        await logMw(uctx, async () => {
          const commandToExecute = text.startsWith('/') ? text.slice(1) : buttonToCommand.get(text);

          const cmd = commandToExecute ?? text;
          const contentMatch = cmd.match(/^\/?content_(\d+)$/i);
          if (contentMatch && config.contentCommand) {
            return config.contentCommand(uctx, parseInt(contentMatch[1], 10));
          }
          const logMatch = cmd.match(/^\/?userlog_(\d+)$/i);
          if (logMatch && config.userLogCommand) {
            return config.userLogCommand(uctx, parseInt(logMatch[1], 10));
          }

          const handler = config.commands[commandToExecute || ''];
          if (handler) {
            await handler(uctx);
          } else if (uctx.chatType === 'private' && config.unknownCommandPhrase) {
            const buttons = config.getButtonsForUnknown?.() ?? [];
            await uctx.reply(config.unknownCommandPhrase(uctx.format), {
              replyKeyboard: buttons.length > 0 ? [buttons] : undefined,
            });
          }
        });
      });
    } catch (err) {
      console.error('[VK Bot] message_new handler error:', err);
    }
  });

  return vk;
}
