import type { SupabaseClient } from '@supabase/supabase-js';
import type { ReplyKeyboardMarkup, InlineKeyboardMarkup, ReplyKeyboardRemove } from 'grammy/types'; // Исправлено: ReplyKeyboardRemove

export type Platform = 'telegram' | 'vk';

export interface UniversalReplyOptions {
  // Telegram-специфичная разметка клавиатуры
  telegramReplyMarkup?: ReplyKeyboardMarkup | InlineKeyboardMarkup | ReplyKeyboardRemove;
  // VK-специфичная клавиатура (JSON строка)
  vkKeyboard?: string;
  // Другие универсальные опции могут быть добавлены здесь, если нужны
}

export interface UniversalContext {
  platform: Platform;
  userId: number;
  peerId: number; // chatId в TG, peerId в VK
  text: string;
  isAdmin: boolean;
  db?: SupabaseClient;
  reply: (text: string, extra?: UniversalReplyOptions) => Promise<void>; // Обновлено
  replyWithFile?: (buffer: Buffer, filename: string, caption?: string) => Promise<void>;
}
