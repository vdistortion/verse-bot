import type { VKContext } from '../types';

export function createLoggerMiddleware() {
  return async (ctx: VKContext, next: () => void | Promise<void>) => {
    const start = Date.now();
    const from = ctx.userId;
    const text = ctx.text ?? '—';

    console.log(`[${new Date().toISOString()}] User ${from}: ${text}`);

    await next();

    console.log(`[${new Date().toISOString()}] Handled in ${Date.now() - start}ms`);
  };
}
