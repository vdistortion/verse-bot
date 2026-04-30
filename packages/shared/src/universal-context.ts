import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReplyKeyboardMarkup, InlineKeyboardMarkup, ReplyKeyboardRemove } from 'grammy/types';

export type Platform = 'telegram' | 'vk';

export interface UniversalReplyOptions {
  telegramReplyMarkup?: ReplyKeyboardMarkup | InlineKeyboardMarkup | ReplyKeyboardRemove;
  vkKeyboard?: string;
  remove_keyboard?: boolean;
}

export interface UniversalContext {
  platform: Platform;
  userId: string;
  peerId: number; // chatId в TG, peerId в VK
  text: string;
  isAdmin: boolean;
  db?: SupabaseClient;
  reply: (text: string, extra?: UniversalReplyOptions) => Promise<void>;
  replyWithFile?: (buffer: Buffer, filename: string, caption?: string) => Promise<void>;
  replyWithPhoto?: (photoUrl: string, caption?: string) => Promise<void>;
}
