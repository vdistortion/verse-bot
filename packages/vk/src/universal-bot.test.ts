import { describe, expect, it } from 'vitest';
import { createUniversalVKBot, getVKCallbackCommand } from './universal-bot.js';

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
  });
});
