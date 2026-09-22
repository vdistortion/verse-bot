import { describe, it, expect } from 'vitest';
import { createVKKeyboard, createVKInlineKeyboard } from './keyboards.js';

describe('createVKKeyboard', () => {
  it('should produce valid keyboard JSON', () => {
    const keyboard = createVKKeyboard([[{ label: 'Hi', command: '/start' }]], true);
    const parsed = JSON.parse(keyboard);
    expect(parsed.one_time).toBe(true);
    expect(parsed.buttons[0][0].action.label).toBe('Hi');
    expect(JSON.parse(parsed.buttons[0][0].action.payload).command).toBe('/start');
  });

  it('should produce inline keyboard JSON', () => {
    const keyboard = createVKInlineKeyboard([[{ label: 'Help', command: '/help' }]]);
    const parsed = JSON.parse(keyboard);
    expect(parsed.inline).toBe(true);
  });
});
