import { createPostgresDatabase, getPool, initPool } from '@verse-bot/postgres';
import type { UniversalContext } from '@verse-bot/core';
// @verse-bot:telegram:start
import { createUniversalTelegramBot } from '@verse-bot/telegram';
// @verse-bot:telegram:end
// @verse-bot:vk:start
import { createUniversalVKBot } from '@verse-bot/vk';
// @verse-bot:vk:end
import { TELEGRAM_BOT_TOKEN, VK_GROUP_TOKEN, VK_GROUP_ID } from './env.js';

// Инициализация БД, если заданы переменные
if (process.env.POSTGRES_USER) {
  initPool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD!,
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB!,
    port: 5432,
  });
}
const database = process.env.POSTGRES_USER ? createPostgresDatabase(getPool()) : undefined;

// Заглушки команд – замените на свои
const commands = {
  ping: async (ctx: UniversalContext) => {
    await ctx.reply('pong');
  },
};

// @verse-bot:telegram:start
if (TELEGRAM_BOT_TOKEN) {
  const bot = createUniversalTelegramBot({
    token: TELEGRAM_BOT_TOKEN,
    database,
    commands,
    buttons: [],
  });
  bot.start();
  console.log('🚀 Telegram bot started');
}
// @verse-bot:telegram:end

// @verse-bot:vk:start
if (VK_GROUP_TOKEN && VK_GROUP_ID) {
  if (!database) {
    console.warn(
      'VK bot started without database (POSTGRES_* not set). User persistence disabled.',
    );
  }

  const bot = createUniversalVKBot({
    token: VK_GROUP_TOKEN,
    groupId: VK_GROUP_ID,
    database,
    commands,
    buttons: [],
  });
  bot.start();
  console.log('🤖 VK bot started');
}
// @verse-bot:vk:end
