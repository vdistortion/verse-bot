import type {
  DatabaseClient,
  Platform,
  RichMessage,
  UserProfile,
  UniversalReplyOptions,
  UniversalCallbackContext,
} from './types.js';

export type UniversalAdminCheck = (ctx: UniversalContext) => boolean | Promise<boolean>;

export interface UniversalContext {
  platform: Platform;
  userId: string;
  dbUserId?: number;
  peerId: number;
  text: string;
  isAdmin: boolean;
  /** Original platform payload, if the update contains one. */
  payload?: unknown;
  /** Present only while handling an inline callback update. */
  callback?: UniversalCallbackContext;

  chatType: 'private' | 'group' | 'channel' | 'supergroup' | 'unknown';
  chatTitle?: string;

  getUserProfile: () => Promise<UserProfile | null>;
  reply: (text: RichMessage, options?: UniversalReplyOptions) => Promise<void>;
  replyWithPhoto: (
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
