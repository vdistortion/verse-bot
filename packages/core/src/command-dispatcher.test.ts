import { describe, expect, it, vi } from 'vitest';
import { dispatchUniversalCommand } from './command-dispatcher.js';
import type { UniversalContext } from './context.js';

const context: UniversalContext = {
  platform: 'telegram',
  userId: '10',
  peerId: 20,
  text: '/start',
  isAdmin: false,
  chatType: 'private',
  getUserProfile: async () => null,
  reply: async () => undefined,
  replySafe: async () => undefined,
};

describe('dispatchUniversalCommand', () => {
  it('dispatches a static command with or without a slash', async () => {
    const handler = vi.fn(async () => undefined);
    const config = { commands: { start: handler } };

    await expect(dispatchUniversalCommand(context, '/start', config)).resolves.toBe(true);
    await expect(dispatchUniversalCommand(context, 'start', config)).resolves.toBe(true);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('dispatches dynamic content and user log commands', async () => {
    const contentCommand = vi.fn(async () => undefined);
    const userLogCommand = vi.fn(async () => undefined);
    const config = { commands: {}, contentCommand, userLogCommand };

    await dispatchUniversalCommand(context, 'content_12', config);
    await dispatchUniversalCommand(context, '/userlog_34', config);

    expect(contentCommand).toHaveBeenCalledWith(context, 12);
    expect(userLogCommand).toHaveBeenCalledWith(context, 34);
  });

  it('returns false for unknown and invalid dynamic commands', async () => {
    const config = { commands: {}, contentCommand: vi.fn(async () => undefined) };

    await expect(dispatchUniversalCommand(context, 'unknown', config)).resolves.toBe(false);
    await expect(dispatchUniversalCommand(context, 'content_0', config)).resolves.toBe(false);
  });
});
