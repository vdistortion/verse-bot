import { describe, expect, it, vi } from 'vitest';
import { createAuthMiddleware, createLoggingMiddleware } from './middleware/index.js';
import type { UniversalContext } from './context.js';

const database: NonNullable<UniversalContext['db']> = {
  query: async () => ({ rows: [] }),
};

function context(overrides: Partial<UniversalContext> = {}): UniversalContext {
  return {
    platform: 'telegram',
    userId: '10',
    peerId: 20,
    text: '/start hello',
    isAdmin: false,
    chatType: 'private',
    getUserProfile: async () => null,
    reply: async () => undefined,
    replySafe: async () => undefined,
    ...overrides,
  };
}

describe('createAuthMiddleware', () => {
  it('creates a user on /start and stores its database id', async () => {
    const findOrCreateUser = vi.fn().mockResolvedValue({ id: 7 });
    const userExists = vi.fn();
    const next = vi.fn().mockResolvedValue(undefined);
    const ctx = context({ db: database });

    await createAuthMiddleware({ findOrCreateUser, userExists })(ctx, next);

    expect(findOrCreateUser).toHaveBeenCalledWith('telegram', '10');
    expect(ctx.dbUserId).toBe(7);
    expect(userExists).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it('stops a non-start command for a deleted user', async () => {
    const findOrCreateUser = vi.fn();
    const userExists = vi.fn().mockResolvedValue(false);
    const next = vi.fn();

    await createAuthMiddleware({ findOrCreateUser, userExists })(
      context({ db: database, text: '/help' }),
      next,
    );

    expect(userExists).toHaveBeenCalledWith('telegram', '10');
    expect(findOrCreateUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('does not treat a command with a longer name as /start', async () => {
    const findOrCreateUser = vi.fn().mockResolvedValue({ id: 7 });
    const userExists = vi.fn().mockResolvedValue(true);
    const next = vi.fn().mockResolvedValue(undefined);

    await createAuthMiddleware({ findOrCreateUser, userExists })(
      context({ db: database, text: '/starter' }),
      next,
    );

    expect(userExists).toHaveBeenCalledWith('telegram', '10');
    expect(findOrCreateUser).toHaveBeenCalledWith('telegram', '10');
    expect(next).toHaveBeenCalledOnce();
  });

  it('passes through without a database', async () => {
    const next = vi.fn().mockResolvedValue(undefined);

    await createAuthMiddleware({ findOrCreateUser: vi.fn(), userExists: vi.fn() })(context(), next);

    expect(next).toHaveBeenCalledOnce();
  });
});

describe('createLoggingMiddleware', () => {
  it('logs the first token and continues', async () => {
    const logCommand = vi.fn().mockResolvedValue(undefined);
    const next = vi.fn().mockResolvedValue(undefined);

    await createLoggingMiddleware({ logCommand })(
      context({ dbUserId: 8, text: '/start extra words' }),
      next,
    );

    expect(logCommand).toHaveBeenCalledWith(8, 'telegram', '/start');
    expect(next).toHaveBeenCalledOnce();
  });

  it('continues without logging when no database user is attached', async () => {
    const logCommand = vi.fn();
    const next = vi.fn().mockResolvedValue(undefined);

    await createLoggingMiddleware({ logCommand })(context(), next);

    expect(logCommand).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
