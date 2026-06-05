import type { UniversalContext } from '../context.js';

export interface LoggingMiddlewareConfig {
  logCommand: (dbUserId: number, platform: string, command: string) => Promise<void>;
}

export function createLoggingMiddleware(config: LoggingMiddlewareConfig) {
  return async (ctx: UniversalContext, next: () => Promise<void>) => {
    if (!ctx.dbUserId) return next();
    const command = ctx.text.split(' ')[0];
    await config.logCommand(ctx.dbUserId, ctx.platform, command);
    await next();
  };
}
