import { describe, it, expect } from 'vitest';
import { createVKKeyboard, createVKInlineKeyboard } from './keyboards.js';

describe('createVKKeyboard', () => {
  it('should produce valid keyboard JSON', () => {
    const keyboard = createVKKeyboard([[{ label: 'Hi', command: '/start' }]], true);
    const parsed = JSON.parse(keyboard);
    expect(parsed.one_time).toBe(true);
    expect(parsed.buttons[0][0].action.label).toBe('Hi');
    expect(JSON.parse(parsed.buttons[0][0].action.payload).command).toBe('/start');
    expect(parsed.buttons[0][0].color).toBe('primary');
  });

  it('should produce inline keyboard JSON', () => {
    const keyboard = createVKInlineKeyboard([
      [
        { label: 'Help', command: '/help' },
        { label: 'Answer', callbackData: 'answer:1', color: 'positive' },
        { label: 'Label fallback' },
      ],
    ]);
    const parsed = JSON.parse(keyboard);
    expect(parsed.inline).toBe(true);
    expect(parsed.buttons[0][0].action.type).toBe('callback');
    expect(JSON.parse(parsed.buttons[0][0].action.payload).command).toBe('/help');
    expect(parsed.buttons[0][1].action.type).toBe('callback');
    expect(JSON.parse(parsed.buttons[0][1].action.payload).callbackData).toBe('answer:1');
    expect(parsed.buttons[0][1].color).toBe('positive');
    expect(JSON.parse(parsed.buttons[0][2].action.payload).command).toBe('Label fallback');
  });
});
