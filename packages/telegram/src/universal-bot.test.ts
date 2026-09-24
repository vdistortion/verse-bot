import { describe, expect, it, vi } from 'vitest';
import type { Update, User } from 'grammy/types';
import { createUniversalTelegramBot } from './universal-bot.js';

describe('createUniversalTelegramBot', () => {
  const botInfo: User = {
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
    bot.botInfo = botInfo;

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

  it('exposes callback capabilities for answering and editing a photo caption', async () => {
    const bot = createUniversalTelegramBot({
      token: 'test:telegram-token',
      commands: {},
      buttons: [],
      onCallback: async (ctx, payload) => {
        expect(payload).toBe('answer:1');
        expect(ctx.callback?.data).toBe('answer:1');
        expect(ctx.callback?.messageId).toBe(2);
        await ctx.callback?.answer('Верно');
        await ctx.callback?.editMessage('Следующий вопрос', {
          inlineKeyboard: [[{ label: 'Ответ', callbackData: 'answer:2' }]],
        });
      },
    });
    bot.botInfo = botInfo;
    const apiCalls: { method: string; payload: Record<string, unknown> }[] = [];
    bot.api.config.use(async (_previous, method, payload) => {
      apiCalls.push({ method, payload });
      return { ok: true, result: true } as never;
    });

    const update: Update = {
      update_id: 1,
      callback_query: {
        id: 'callback-id',
        from: { id: 10, is_bot: false, first_name: 'Alice' },
        chat_instance: 'chat-instance',
        data: 'answer:1',
        message: {
          message_id: 2,
          date: 1,
          chat: { id: 20, type: 'private', first_name: 'Alice' },
          caption: 'Какой это флаг?',
          photo: [
            { file_id: 'photo-id', file_unique_id: 'photo-unique-id', width: 10, height: 10 },
          ],
        },
      },
    };

    await bot.handleUpdate(update);

    expect(apiCalls.filter((call) => call.method === 'answerCallbackQuery')).toEqual([
      expect.objectContaining({ payload: expect.objectContaining({ text: 'Верно' }) }),
    ]);
    expect(apiCalls).toContainEqual(
      expect.objectContaining({
        method: 'editMessageCaption',
        payload: expect.objectContaining({
          chat_id: 20,
          message_id: 2,
          caption: 'Следующий вопрос',
        }),
      }),
    );
  });

  it('runs the fallback message handler with the result of the configured admin check', async () => {
    const onMessage = vi.fn();
    const bot = createUniversalTelegramBot({
      token: 'test:telegram-token',
      commands: {},
      buttons: [],
      checkAdmin: async () => true,
      onMessage,
    });
    bot.botInfo = botInfo;

    const update: Update = {
      update_id: 2,
      message: {
        message_id: 3,
        date: 1,
        chat: { id: 20, type: 'private', first_name: 'Alice' },
        from: { id: 10, is_bot: false, first_name: 'Alice' },
        text: 'plain text',
      },
    };

    await bot.handleUpdate(update);

    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage.mock.calls[0]?.[0]).toMatchObject({ isAdmin: true, text: 'plain text' });
  });

  it('does not send dynamic commands to the fallback message handler', async () => {
    const onMessage = vi.fn();
    const contentCommand = vi.fn();
    const bot = createUniversalTelegramBot({
      token: 'test:telegram-token',
      commands: {},
      buttons: [],
      contentCommand,
      onMessage,
    });
    bot.botInfo = botInfo;

    const update: Update = {
      update_id: 3,
      message: {
        message_id: 4,
        date: 1,
        chat: { id: 20, type: 'private', first_name: 'Alice' },
        from: { id: 10, is_bot: false, first_name: 'Alice' },
        text: '/content_7',
        entities: [{ type: 'bot_command', offset: 0, length: 10 }],
      },
    };

    await bot.handleUpdate(update);

    expect(contentCommand).toHaveBeenCalledOnce();
    expect(contentCommand).toHaveBeenCalledWith(expect.anything(), 7);
    expect(onMessage).not.toHaveBeenCalled();
  });
});
