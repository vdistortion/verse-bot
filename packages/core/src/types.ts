export type Platform = 'telegram' | 'vk';

export interface DatabaseClient {
  query<T = unknown>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>;
}

export interface BotPersistence {
  findOrCreateUser(platform: Platform, platformUserId: string): Promise<{ id: number } | null>;
  userExists(platform: Platform, platformUserId: string): Promise<boolean>;
  logCommand(dbUserId: number, platform: Platform, command: string): Promise<void>;
}

export interface BotDatabase {
  client: DatabaseClient;
  persistence: BotPersistence;
}

export interface UserProfile {
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface UniversalCommandButton {
  command: string;
  label: string;
}

export interface UniversalKeyboardButton {
  label: string;
  command?: string;
  /** Callback data for inline buttons. Falls back to `command`, then `label`. */
  callbackData?: string;
  /** VK button color. Telegram adapters ignore this option. */
  color?: 'primary' | 'secondary' | 'negative' | 'positive';
}

export interface UniversalReplyOptions {
  remove_keyboard?: boolean;
  link_preview_options?: { is_disabled: boolean };
  replyKeyboard?: UniversalKeyboardButton[][];
  inlineKeyboard?: UniversalKeyboardButton[][];
  one_time?: boolean;
}

export type UniversalEditOptions = Pick<
  UniversalReplyOptions,
  'inlineKeyboard' | 'link_preview_options'
>;

/** Capabilities available while handling an inline callback update. */
export interface UniversalCallbackContext {
  /** Callback data normalized to a string by the platform adapter. */
  data: string;
  /** Message identifier in the current chat/conversation, when available. */
  messageId?: number;
  answer: (text?: string) => Promise<void>;
  editMessage: (message: RichMessage, options?: UniversalEditOptions) => Promise<void>;
}

export interface RenderableMessage {
  toHTML(): string;
}

export type RichMessage = string | RenderableMessage;
