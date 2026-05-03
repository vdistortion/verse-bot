import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReplyKeyboardMarkup, InlineKeyboardMarkup, ReplyKeyboardRemove } from 'grammy/types';

export type Platform = 'telegram' | 'vk';

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
  db?: SupabaseClient;
  firstName?: string;
  lastName?: string;
  username?: string;
  reply: (text: string, extra?: UniversalReplyOptions) => Promise<void>;
  replyWithFile?: (buffer: Buffer, filename: string, caption?: string) => Promise<void>;
  replyWithPhoto?: (photoUrl: string, caption?: string) => Promise<void>;
  chatType: 'channel' | 'private' | 'group' | 'supergroup' | 'unknown';
}
