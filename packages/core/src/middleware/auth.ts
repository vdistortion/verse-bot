import type { UniversalContext } from '../context.js';
import type { Platform } from '../types.js';

export interface AuthMiddlewareConfig {
  findOrCreateUser: (platform: Platform, userId: string) => Promise<{ id: number } | null>;
  userExists: (platform: Platform, userId: string) => Promise<boolean>;
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  return async (ctx: UniversalContext, next: () => Promise<void>) => {
    if (!ctx.db) return next(); // БД нет – пропускаем
    const { platform, userId, text } = ctx;
    const isStart = text.startsWith('/start');
    if (isStart) {
      const dbUser = await config.findOrCreateUser(platform, userId);
      if (dbUser) ctx.dbUserId = dbUser.id;
    } else {
      const exists = await config.userExists(platform, userId);
      if (!exists) return; // пользователь удалён
      const dbUser = await config.findOrCreateUser(platform, userId);
      if (dbUser) ctx.dbUserId = dbUser.id;
    }
    await next();
  };
}
