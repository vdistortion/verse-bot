import { describe, expect, it, vi } from 'vitest';
import { createDbMiddleware } from './middleware/db.js';
import { loggerMiddleware } from './middleware/logger.js';

describe('Telegram middleware', () => {
  it('attaches the configured database before continuing', async () => {
    const db = { query: vi.fn() };
    const next = vi.fn().mockResolvedValue(undefined);
    const ctx = {} as Parameters<typeof createDbMiddleware>[0];

    await createDbMiddleware(db as never)(ctx as never, next);

    expect((ctx as { db?: unknown }).db).toBe(db);
    expect(next).toHaveBeenCalledOnce();
  });

  it('logs incoming and completed updates', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const next = vi.fn().mockResolvedValue(undefined);
    const ctx = {
      from: { username: 'alice', id: 1 },
      message: { text: '/start' },
    } as never;

    await loggerMiddleware(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0]?.[0]).toContain('@alice: /start');
    log.mockRestore();
  });
});
