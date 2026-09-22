import { describe, expect, it } from 'vitest';
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
});
