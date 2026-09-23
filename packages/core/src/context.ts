import type {
  DatabaseClient,
  Platform,
  RichMessage,
  UserProfile,
  UniversalReplyOptions,
} from './types.js';

export interface UniversalContext {
  platform: Platform;
  userId: string;
  dbUserId?: number;
  peerId: number;
  text: string;
  isAdmin: boolean;

  chatType: 'private' | 'group' | 'channel' | 'supergroup' | 'unknown';
  chatTitle?: string;

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

  db?: DatabaseClient;

  platformApi?: unknown;
}
