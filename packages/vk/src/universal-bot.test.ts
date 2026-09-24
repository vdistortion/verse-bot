import { describe, expect, it, vi } from 'vitest';
import type { UserProfile } from '@verse-bot/core';
import { MessageContext, MessageEventContext, UpdateSource } from 'vk-io';
import { createUniversalVKBot, getVKCallbackCommand, getVKCallbackData } from './universal-bot.js';

describe('createUniversalVKBot', () => {
  it('creates a bot without a database integration', () => {
    const bot = createUniversalVKBot({
      token: 'test-vk-token',
      groupId: 1,
      commands: {},
      buttons: [],
    });

    expect(bot).toBeDefined();
  });

  it('extracts commands from VK callback payloads', () => {
    expect(getVKCallbackCommand('{"command":"/start"}')).toBe('/start');
    expect(getVKCallbackCommand({ command: 'help' })).toBe('help');
    expect(getVKCallbackCommand('plain-command')).toBe('plain-command');
    expect(getVKCallbackCommand('{"action":"help"}')).toBeUndefined();
    expect(getVKCallbackCommand({ callbackData: 'answer:1' })).toBe('answer:1');
  });

  it('normalizes VK callback data to a string', () => {
    expect(getVKCallbackData({ command: '/start' })).toBe('/start');
    expect(getVKCallbackData({ callbackData: 'answer:1' })).toBe('answer:1');
    expect(getVKCallbackData({ action: 'answer', index: 1 })).toBe('{"action":"answer","index":1}');
  });

  it('answers VK callbacks and edits their source message through the universal context', async () => {
    const bot = createUniversalVKBot({
      token: 'test-vk-token',
      groupId: 1,
      commands: {},
      buttons: [],
      checkAdmin: async () => true,
      onCallback: async (ctx, payload) => {
        expect(payload).toBe('answer:1');
        expect(ctx.isAdmin).toBe(true);
        expect(ctx.callback?.data).toBe('answer:1');
        expect(ctx.callback?.messageId).toBe(2);
        await ctx.callback?.answer('Correct');
        await ctx.callback?.editMessage('Next question', {
          inlineKeyboard: [[{ label: 'Answer', callbackData: 'answer:2' }]],
          link_preview_options: { is_disabled: true },
        });
      },
    });
    const call = vi.spyOn(bot.api, 'callWithRequest').mockResolvedValue(1 as never);
    const event = new MessageEventContext({
      api: bot.api,
      upload: bot.upload,
      type: 'message_event',
      subTypes: ['message_event'],
      payload: {
        user_id: 10,
        conversation_message_id: 2,
        peer_id: 20,
        event_id: 'event-id',
        payload: { callbackData: 'answer:1' },
      },
      source: UpdateSource.POLLING,
      updateType: 'message_event',
    });

    await bot.updates.dispatchMiddleware(event);

    expect(call.mock.calls.map(([request]) => request)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: 'messages.sendMessageEventAnswer',
          params: expect.objectContaining({
            event_id: 'event-id',
            user_id: 10,
            peer_id: 20,
            event_data: JSON.stringify({ type: 'show_snackbar', text: 'Correct' }),
          }),
        }),
        expect.objectContaining({
          method: 'messages.edit',
          params: expect.objectContaining({
            peer_id: 20,
            cmid: 2,
            message: 'Next question',
            dont_parse_links: true,
          }),
        }),
      ]),
    );
    expect(call).toHaveBeenCalledTimes(2);
  });

  it('routes unhandled VK messages to onMessage with the asynchronous admin check', async () => {
    const onMessage = vi.fn();
    const bot = createUniversalVKBot({
      token: 'test-vk-token',
      groupId: 1,
      commands: {},
      buttons: [],
      checkAdmin: async () => true,
      onMessage,
    });
    const event = new MessageContext({
      api: bot.api,
      upload: bot.upload,
      type: 'message',
      subTypes: ['message_new'],
      payload: {
        message: {
          id: 1,
          conversation_message_id: 1,
          out: 0,
          peer_id: 20,
          from_id: 10,
          text: 'https://example.com/album',
          date: 1,
          random_id: 0,
          attachments: [],
          important: false,
        },
        client_info: {
          button_actions: ['callback'],
          keyboard: true,
          inline_keyboard: true,
          carousel: false,
          lang_id: 0,
        },
      },
      source: UpdateSource.POLLING,
      updateType: 'message_new',
    });

    await bot.updates.dispatchMiddleware(event);

    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage.mock.calls[0]?.[0]).toMatchObject({
      isAdmin: true,
      text: 'https://example.com/album',
    });
  });

  it('returns null when the VK profile lookup fails', async () => {
    let profile: UserProfile | null | undefined;
    const bot = createUniversalVKBot({
      token: 'test-vk-token',
      groupId: 1,
      commands: {},
      buttons: [],
      onMessage: async (ctx) => {
        profile = await ctx.getUserProfile();
      },
    });
    const call = vi
      .spyOn(bot.api, 'callWithRequest')
      .mockRejectedValue(new Error('VK API error') as never);
    const event = new MessageContext({
      api: bot.api,
      upload: bot.upload,
      type: 'message',
      subTypes: ['message_new'],
      payload: {
        message: {
          id: 1,
          conversation_message_id: 1,
          out: 0,
          peer_id: 20,
          from_id: 10,
          text: 'profile',
          date: 1,
          random_id: 0,
          attachments: [],
          important: false,
        },
        client_info: {
          button_actions: ['callback'],
          keyboard: true,
          inline_keyboard: true,
          carousel: false,
          lang_id: 0,
        },
      },
      source: UpdateSource.POLLING,
      updateType: 'message_new',
    });

    await bot.updates.dispatchMiddleware(event);

    expect(call).toHaveBeenCalledOnce();
    expect(profile).toBeNull();
  });

  it('sends an existing VK photo attachment without downloading it', async () => {
    const bot = createUniversalVKBot({
      token: 'test-vk-token',
      groupId: 1,
      commands: {},
      buttons: [],
      onMessage: async (ctx) => {
        await ctx.replyWithPhoto('photo-123_456', 'Existing photo');
      },
    });
    const call = vi.spyOn(bot.api, 'callWithRequest').mockResolvedValue(1 as never);
    const event = new MessageContext({
      api: bot.api,
      upload: bot.upload,
      type: 'message',
      subTypes: ['message_new'],
      payload: {
        message: {
          id: 1,
          conversation_message_id: 1,
          out: 0,
          peer_id: 20,
          from_id: 10,
          text: 'send photo',
          date: 1,
          random_id: 0,
          attachments: [],
          important: false,
        },
        client_info: {
          button_actions: ['callback'],
          keyboard: true,
          inline_keyboard: true,
          carousel: false,
          lang_id: 0,
        },
      },
      source: UpdateSource.POLLING,
      updateType: 'message_new',
    });

    await bot.updates.dispatchMiddleware(event);

    expect(call.mock.calls.map(([request]) => request)).toContainEqual(
      expect.objectContaining({
        method: 'messages.send',
        params: expect.objectContaining({
          attachment: 'photo-123_456',
          message: 'Existing photo',
        }),
      }),
    );
    expect(call).toHaveBeenCalledOnce();
  });

  it('applies shared keyboard options and leaves scoped document uploads unavailable', async () => {
    const bot = createUniversalVKBot({
      token: 'test-vk-token',
      groupId: 1,
      commands: {},
      buttons: [],
      onMessage: async (ctx) => {
        expect(ctx.replyWithFile).toBeUndefined();
        const keyboard = [[{ label: 'Menu' }]];
        await ctx.replySafe('Safe group reply', {
          replyKeyboard: keyboard,
          one_time: true,
          link_preview_options: { is_disabled: true },
        });
        await ctx.reply('One-time menu', { replyKeyboard: keyboard, one_time: true });
        await ctx.reply('Hide menu', { remove_keyboard: true });
      },
    });
    const call = vi.spyOn(bot.api, 'callWithRequest').mockResolvedValue(1 as never);
    const event = new MessageContext({
      api: bot.api,
      upload: bot.upload,
      type: 'message',
      subTypes: ['message_new'],
      payload: {
        message: {
          id: 1,
          conversation_message_id: 1,
          out: 0,
          peer_id: 2_000_000_001,
          from_id: 10,
          text: 'send backup',
          date: 1,
          random_id: 0,
          attachments: [],
          important: false,
        },
        client_info: {
          button_actions: ['callback'],
          keyboard: true,
          inline_keyboard: true,
          carousel: false,
          lang_id: 0,
        },
      },
      source: UpdateSource.POLLING,
      updateType: 'message_new',
    });

    await bot.updates.dispatchMiddleware(event);

    const requests = call.mock.calls.map(([request]) => request);
    expect(requests).toHaveLength(3);
    expect(requests[0]?.params).toMatchObject({
      message: 'Safe group reply',
      dont_parse_links: true,
    });
    expect(requests[0]?.params.keyboard).toBeUndefined();
    expect(JSON.parse(requests[1]?.params.keyboard as string)).toMatchObject({
      one_time: true,
      buttons: [[{ action: { label: 'Menu' } }]],
    });
    expect(JSON.parse(requests[2]?.params.keyboard as string)).toEqual({
      one_time: true,
      buttons: [],
    });
  });
});
