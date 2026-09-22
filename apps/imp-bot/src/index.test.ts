import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const command = vi.fn(async () => undefined);
  return {
    commands: {
      adminCommand: command,
      adviceCommand: command,
      backupDbCommand: command,
      backupFilesCommand: command,
      catCommand: command,
      contentCommand: command,
      helpCommand: command,
      idCommand: command,
      listUsersCommand: command,
      myLogCommand: command,
      quoteCommand: command,
      randomCommand: command,
      startCommand: command,
      statsCommand: command,
      stopCommand: command,
      userLogCommand: command,
    },
    database: { client: {}, persistence: {} },
    pool: {},
    createTelegramBot: vi.fn((_config: unknown) => ({ start: vi.fn(async () => undefined) })),
    createVKBot: vi.fn((_config: unknown) => ({ start: vi.fn(async () => undefined) })),
    initPool: vi.fn(),
    getPool: vi.fn(() => ({}) as never),
    createPostgresDatabase: vi.fn(() => ({ client: {}, persistence: {} })),
  };
});

vi.mock('@verse-bot/postgres', () => ({
  createPostgresDatabase: mocks.createPostgresDatabase,
  getPool: mocks.getPool,
  initPool: mocks.initPool,
}));

vi.mock('@verse-bot/telegram', () => ({
  createUniversalTelegramBot: mocks.createTelegramBot,
}));

vi.mock('@verse-bot/vk', () => ({
  createUniversalVKBot: mocks.createVKBot,
}));

vi.mock('./commands/index.js', () => mocks.commands);

vi.mock('./env.js', () => ({
  CONTENT_DIR: '/tmp/content',
  POSTGRES_DB: 'postgres',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PASSWORD: 'password',
  POSTGRES_USER: 'postgres',
  TELEGRAM_ADMIN_ID: 1,
  TELEGRAM_BOT_TOKEN: 'telegram-token',
  VK_ADMIN_ID: 2,
  VK_GROUP_ID: 3,
  VK_GROUP_TOKEN: 'vk-token',
}));

vi.mock('./locales/ru.js', () => ({
  getButtons: () => [{ command: '/start', label: 'Start' }],
  phrases: { unknownCommand: vi.fn() },
}));

describe('imp-bot startup configuration', () => {
  it('creates both adapters with shared commands and database integration', async () => {
    await import('./index.js');

    expect(mocks.initPool).toHaveBeenCalledOnce();
    expect(mocks.createPostgresDatabase).toHaveBeenCalledOnce();
    expect(mocks.createTelegramBot).toHaveBeenCalledOnce();
    expect(mocks.createVKBot).toHaveBeenCalledOnce();

    const telegramConfig = mocks.createTelegramBot.mock.calls[0]?.[0] as {
      database: unknown;
      commands: Record<string, unknown>;
    };
    const vkConfig = mocks.createVKBot.mock.calls[0]?.[0] as {
      database: unknown;
      commands: Record<string, unknown>;
    };

    expect(telegramConfig.database).toBe(vkConfig.database);
    expect(telegramConfig.commands.start).toBe(vkConfig.commands.start);
    expect(telegramConfig.commands.stats).toBe(vkConfig.commands.stats);
    expect(telegramConfig.commands.backupdb).toBeDefined();
    expect(vkConfig.commands.backupdb).toBeUndefined();
  });
});
