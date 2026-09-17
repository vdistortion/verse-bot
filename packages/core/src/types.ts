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

export interface RenderableMessage {
  toHTML(): string;
}

export type FormatFn = (strings: TemplateStringsArray, ...values: any[]) => RichMessage;

export type RichMessage = string | RenderableMessage;
