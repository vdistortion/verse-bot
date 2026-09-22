export type Platform = 'telegram' | 'vk';

export interface DatabaseClient {
  query<T = unknown>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[] }>;
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

export type RichMessage = string | RenderableMessage;
