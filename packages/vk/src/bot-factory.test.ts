import { describe, expect, it, vi } from 'vitest';
import { createVKBot } from './bot-factory.js';
import { VK_MAX_RANDOM_ID } from './vk-constants.js';

describe('VKBot', () => {
  it('forwards arbitrary API requests', async () => {
    const bot = createVKBot({ token: 'test-token', groupId: 123 });
    const call = vi.spyOn(bot.api, 'call').mockResolvedValue({ ok: true } as never);

    await expect(bot.request('users.get', { user_ids: [10] })).resolves.toEqual({ ok: true });
    expect(call).toHaveBeenCalledWith('users.get', { user_ids: [10] });
  });

  it('builds messages.send parameters with optional fields', async () => {
    const bot = createVKBot({ token: 'test-token', groupId: 123 });
    const call = vi.spyOn(bot.api, 'call').mockResolvedValue(77 as never);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    await expect(bot.sendMessage(456, 'hello', '{"inline":true}', 'photo1_2')).resolves.toBe(77);

    expect(call).toHaveBeenCalledWith('messages.send', {
      peer_id: 456,
      message: 'hello',
      random_id: Math.floor(0.5 * VK_MAX_RANDOM_ID),
      keyboard: '{"inline":true}',
      attachment: 'photo1_2',
    });
  });
});
