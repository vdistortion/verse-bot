import { initPool, getPool } from '@verse/shared';
import { createUniversalTelegramBot } from '@verse/tg-core';
import { createUniversalVKBot } from '@verse/vk-core';
import { TELEGRAM_BOT_TOKEN, VK_GROUP_TOKEN, VK_GROUP_ID } from './env.js';

// Инициализация БД, если заданы переменные
if (process.env.POSTGRES_USER) {
  const poolConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD!,
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB!,
    port: 5432,
  };
  initPool(poolConfig);
}

// Заглушки команд – замените на свои
const commands = {
  ping: async (ctx: any) => {
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
  bot.start().then(() => console.log('🤖 Telegram bot started'));
}

// VK
if (VK_GROUP_TOKEN && VK_GROUP_ID) {
  const pool = getPool(); // если БД не используется, getPool() выбросит ошибку,
  // но можно обернуть в try или проверять наличие process.env.POSTGRES_USER
  const bot = createUniversalVKBot({
    token: VK_GROUP_TOKEN,
    groupId: VK_GROUP_ID,
    commands,
    buttons: [],
    pool,
  });
  bot.start().then(() => console.log('🤖 VK bot started'));
}
