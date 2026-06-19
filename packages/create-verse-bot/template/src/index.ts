import { initPool, getPool } from '@verse-bot/db';
import type { UniversalContext } from '@verse-bot/core';
import { createUniversalTelegramBot } from '@verse-bot/tg-core';
import { createUniversalVKBot } from '@verse-bot/vk-core';
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

// Заглушки команд – замените на свои
const commands = {
  ping: async (ctx: UniversalContext) => {
    await ctx.reply('pong');
  },
};

// Telegram
if (TELEGRAM_BOT_TOKEN) {
  const bot = createUniversalTelegramBot({
    token: TELEGRAM_BOT_TOKEN,
    commands,
    buttons: [],
  });
  bot.start();
  console.log('🚀 Telegram bot started');
}

// VK
if (VK_GROUP_TOKEN && VK_GROUP_ID) {
  const pool = process.env.POSTGRES_USER ? getPool() : undefined;

  if (!pool) {
    console.warn(
      'VK bot started without database (POSTGRES_* not set). User persistence disabled.',
    );
  }

  const bot = createUniversalVKBot({
    token: VK_GROUP_TOKEN,
    groupId: VK_GROUP_ID,
    commands,
    buttons: [],
    pool,
  });
  bot.start();
  console.log('🤖 VK bot started');
}
