import type { Pool } from 'pg'; // временно, позже уберём
import type {
  FormatFn,
  Platform,
  RichMessage,
  UserProfile,
  UniversalReplyOptions,
} from './types.js';

export interface UniversalContext {
  // Идентификация
  platform: Platform;
  userId: string; // ID пользователя в платформе (строка)
  dbUserId?: number; // внутренний ID из таблицы users
  peerId: number; // ID чата/диалога
  text: string; // текст команды или сообщения
  isAdmin: boolean;

  // Чат
  chatType: 'private' | 'group' | 'channel' | 'supergroup' | 'unknown';
  chatTitle?: string;

  // Методы, которые реализуют адаптеры
  getUserProfile: () => Promise<UserProfile | null>;
  reply: (text: RichMessage, options?: UniversalReplyOptions) => Promise<void>;
  replyWithPhoto?: (
    photoUrl: string,
    caption?: RichMessage,
    options?: UniversalReplyOptions,
  ) => Promise<void>;
  replyWithFile?: (
    buffer: Buffer,
    filename: string,
    caption?: RichMessage,
    options?: UniversalReplyOptions,
  ) => Promise<void>;
  replySafe: (text: RichMessage, options?: UniversalReplyOptions) => Promise<void>;
  format: FormatFn;

  // База данных (опционально, будет заменено на абстракцию)
  db?: Pool;

  // контекст
  platformApi?: unknown;
}
