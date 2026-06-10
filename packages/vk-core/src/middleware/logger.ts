import type { MessageContext, Context } from 'vk-io';

export function createLoggerMiddleware() {
  return async (ctx: Context, next: () => Promise<unknown>): Promise<void> => {
    const start = Date.now();
    const messageCtx = ctx as MessageContext;
    const from = messageCtx.senderId || 'unknown';
    const text = messageCtx.text ?? '—';
    console.log(`[${new Date().toISOString()}] VK @${from}: ${text}`);
    await next();
    console.log(`[${new Date().toISOString()}] VK Handled in ${Date.now() - start}ms`);
  };
}
