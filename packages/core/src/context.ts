import type { Pool } from 'pg'; // временно, позже уберём
import type { Platform, UserProfile, UniversalReplyOptions } from './types.js';

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
  reply: (text: string, options?: UniversalReplyOptions) => Promise<void>;
  replyWithPhoto?: (
    photoUrl: string,
    caption?: string,
    options?: UniversalReplyOptions,
  ) => Promise<void>;
  replyWithFile?: (
    buffer: Buffer,
    filename: string,
    caption?: string,
    options?: UniversalReplyOptions,
  ) => Promise<void>;
  replySafe: (text: string, options?: UniversalReplyOptions) => Promise<void>;

  // Форматирование (шаблонная строка с токенами)
  format: (strings: TemplateStringsArray, ...values: any[]) => string;

  // База данных (опционально, будет заменено на абстракцию)
  db?: Pool;

  // контекст
  platformApi?: unknown;
}
