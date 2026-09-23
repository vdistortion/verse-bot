import { describe, expect, it, vi } from 'vitest';
import type { Update } from 'grammy/types';
import { createUniversalTelegramBot } from './universal-bot.js';

describe('createUniversalTelegramBot', () => {
  it('creates a bot without a database integration', () => {
    const bot = createUniversalTelegramBot({
      token: 'test:telegram-token',
      commands: {},
      buttons: [],
    });

    expect(bot).toBeDefined();
  });

  it('routes Telegram commands into a universal context', async () => {
    const command = vi.fn().mockResolvedValue(undefined);
    const bot = createUniversalTelegramBot({
      token: 'test:telegram-token',
      adminId: 10,
      commands: { start: command },
      buttons: [{ command: 'start', label: 'Start' }],
    });
    bot.botInfo = {
      id: 999,
      is_bot: true,
      first_name: 'Test',
      username: 'test_bot',
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
      has_topics_enabled: false,
      allows_users_to_create_topics: false,
      can_manage_bots: false,
      supports_join_request_queries: false,
    };

    const update: Update = {
      update_id: 1,
      message: {
        message_id: 2,
        date: 1,
        chat: { id: 20, type: 'private', first_name: 'Alice' },
        from: { id: 10, is_bot: false, first_name: 'Alice' },
        text: '/start',
        entities: [{ type: 'bot_command', offset: 0, length: 6 }],
      },
    };

    await bot.handleUpdate(update);

    expect(command).toHaveBeenCalledOnce();
    const ctx = command.mock.calls[0]?.[0] as {
      platform: string;
      userId: string;
      peerId: number;
      isAdmin: boolean;
      chatType: string;
      text: string;
    };
    expect(ctx).toMatchObject({
      platform: 'telegram',
      userId: '10',
      peerId: 20,
      isAdmin: true,
      chatType: 'private',
      text: '/start',
    });
  });
});
