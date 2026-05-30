import type { Pool } from 'pg';
import type { ReplyKeyboardMarkup, InlineKeyboardMarkup, ReplyKeyboardRemove } from 'grammy/types';
import type { FormatToken, Platform } from './format/index.js';

export interface UniversalReplyOptions {
  parse_mode?: 'MarkdownV2';
  telegramReplyMarkup?: ReplyKeyboardMarkup | InlineKeyboardMarkup | ReplyKeyboardRemove;
  vkKeyboard?: string;
  remove_keyboard?: boolean;
  link_preview_options?: { is_disabled: boolean };
}

export interface UniversalContext {
  platform: Platform;
  userId: string;
  dbUserId?: number; // Внутренний ID пользователя из таблицы `users`
  peerId: number; // chatId в TG, peerId в VK
  text: string;
  isAdmin: boolean;
  db?: Pool;
  firstName?: string;
  lastName?: string;
  username?: string;
  format: (strings: TemplateStringsArray, ...values: (string | FormatToken)[]) => string;
  replySafe: (text: string, extra?: UniversalReplyOptions) => Promise<void>;
  reply: (text: string, extra?: UniversalReplyOptions) => Promise<void>;
  replyWithFile?: (buffer: Buffer, filename: string, caption?: string) => Promise<void>;
  replyWithPhoto?: (photoUrl: string, caption?: string) => Promise<void>;
  chatType: 'channel' | 'private' | 'group' | 'supergroup' | 'unknown';
  tgApi?: any; // API Telegram-бота (GrammY)
  vkApi?: any; // Экземпляр VK-бота
}
