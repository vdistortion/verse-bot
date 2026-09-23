import { describe, expect, it } from 'vitest';
import { createTelegramInlineKeyboard } from './keyboards/inline-universal.js';
import { createTelegramKeyboard } from './keyboards/reply-universal.js';

describe('Telegram universal keyboards', () => {
  it('maps inline labels and commands into callback data', () => {
    const keyboard = createTelegramInlineKeyboard([
      [{ label: 'Start', command: '/start' }, { label: 'Help' }],
    ]);

    expect(keyboard.inline_keyboard).toEqual([
      [
        { text: 'Start', callback_data: '/start' },
        { text: 'Help', callback_data: 'Help' },
      ],
    ]);
  });

  it('creates reply rows and applies keyboard options', () => {
    const keyboard = createTelegramKeyboard(
      [[{ label: 'One' }, { label: 'Two' }], [{ label: 'Three' }]],
      true,
      true,
    );

    expect(keyboard).toMatchObject({
      keyboard: [[{ text: 'One' }, { text: 'Two' }], [{ text: 'Three' }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    });
  });
});
