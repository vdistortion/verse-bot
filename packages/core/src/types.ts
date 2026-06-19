import type { fmtRich, RichDocument } from 'tg-rich-messages';

export type Platform = 'telegram' | 'vk';

export interface UserProfile {
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface UniversalKeyboardButton {
  label: string;
  command?: string;
}

export interface UniversalReplyOptions {
  remove_keyboard?: boolean;
  link_preview_options?: { is_disabled: boolean };
  replyKeyboard?: UniversalKeyboardButton[][];
  inlineKeyboard?: UniversalKeyboardButton[][];
  one_time?: boolean;
}

export type FormatFn = typeof fmtRich;

export type RichMessage = string | RichDocument;
