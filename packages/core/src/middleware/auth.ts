import type { UniversalContext } from '../context.js';

export interface AuthMiddlewareConfig {
  findOrCreateUser: (platform: string, userId: string) => Promise<{ id: number } | null>;
  userExists: (platform: string, userId: string) => Promise<boolean>;
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  return async (ctx: UniversalContext, next: () => Promise<void>) => {
    if (!ctx.db) return next(); // нет БД — пропускаем
    const { platform, userId } = ctx;
    const isStart = ctx.text.startsWith('/start');
    if (isStart) {
      const dbUser = await config.findOrCreateUser(platform, userId);
      if (dbUser) ctx.dbUserId = dbUser.id;
    } else {
      const exists = await config.userExists(platform, userId);
      if (!exists) return; // пользователь удалён — игнорируем
      const dbUser = await config.findOrCreateUser(platform, userId);
      if (dbUser) ctx.dbUserId = dbUser.id;
    }
    await next();
  };
}
