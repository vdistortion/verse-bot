import { describe, expect, it } from 'vitest';
import { createUniversalVKBot } from './universal-bot.js';

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
});
