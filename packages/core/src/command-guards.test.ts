import { describe, it, expect, vi } from 'vitest';
import { fmtRich } from 'tg-rich-messages';
import { requireAdmin, requirePrivateChat, catchErrors } from './command-guards.js';
import type { UniversalContext } from './context.js';

function mockContext(overrides: Partial<UniversalContext> = {}): UniversalContext {
  return {
    platform: 'telegram',
    userId: '123',
    peerId: 456,
    text: '/test',
    isAdmin: false,
    chatType: 'private',
    format: fmtRich,
    replySafe: vi.fn(),
    reply: vi.fn(),
    getUserProfile: vi.fn(),
    ...overrides,
  };
}

describe('requireAdmin', () => {
  it('should call handler for admin in private chat', async () => {
    const handler = vi.fn();
    const ctx = mockContext({ isAdmin: true, chatType: 'private' });
    const wrapped = requireAdmin(handler);
    await wrapped(ctx);
    expect(handler).toHaveBeenCalled();
  });

  it('should not call handler for non-admin', async () => {
    const handler = vi.fn();
    const ctx = mockContext({ isAdmin: false });
    const wrapped = requireAdmin(handler);
    await wrapped(ctx);
    expect(handler).not.toHaveBeenCalled();
  });

  it('should not call handler in group chat', async () => {
    const handler = vi.fn();
    const ctx = mockContext({ isAdmin: true, chatType: 'group' });
    const wrapped = requireAdmin(handler);
    await wrapped(ctx);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('requirePrivateChat', () => {
  it('should call handler in private chat', async () => {
    const handler = vi.fn();
    const ctx = mockContext({ chatType: 'private' });
    const wrapped = requirePrivateChat(handler);
    await wrapped(ctx);
    expect(handler).toHaveBeenCalled();
  });

  it('should not call handler in group chat', async () => {
    const handler = vi.fn();
    const ctx = mockContext({ chatType: 'group' });
    const wrapped = requirePrivateChat(handler);
    await wrapped(ctx);
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('catchErrors', () => {
  it('should call handler normally', async () => {
    const handler = vi.fn();
    const phrases = {
      errorDefault: (fmt: typeof fmtRich) => fmt`custom error`,
    };
    const ctx = mockContext();
    const wrapped = catchErrors(handler, phrases);
    await wrapped(ctx);
    expect(handler).toHaveBeenCalled();
  });

  it('should catch error and reply with error message', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('oops'));
    const phrases = {
      errorDefault: (fmt: typeof fmtRich) => fmt`custom error`,
    };
    const ctx = mockContext();
    const wrapped = catchErrors(handler, phrases);
    await wrapped(ctx);
    expect(ctx.replySafe).toHaveBeenCalledOnce();
    const [message] = vi.mocked(ctx.replySafe).mock.calls[0];
    expect(typeof message === 'string' ? message : message.toHTML()).toBe('<p>custom error</p>');
  });
});
