import { initPool, getPool } from '@verse-bot/shared';
import { createUniversalTelegramBot } from '@verse-bot/tg-core';
import { createUniversalVKBot } from '@verse-bot/vk-core';
import * as env from './env.js';
import * as commands from './commands/index.js';
import { phrases, getButtons } from './locales/ru.js';


initPool({
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  host: env.POSTGRES_HOST,
  database: env.POSTGRES_DB,
  port: 5432,
});

const allButtons = [...getButtons(true), ...getButtons(false)].map((b) => ({
  command: b.command.replace('/', ''),
  label: b.label,
}));

// Уникальные кнопки
const uniqueButtons = Array.from(new Map(allButtons.map((b) => [b.command + b.label, b])).values());

// Telegram
if (env.TELEGRAM_BOT_TOKEN) {
  const tgBot = createUniversalTelegramBot({
    token: env.TELEGRAM_BOT_TOKEN,
    adminId: env.TELEGRAM_ADMIN_ID,
    commands: {
      start: commands.startCommand,
      full: commands.fullCommand,
      cat: commands.catCommand,
      quote: commands.quoteCommand,
      advice: commands.adviceCommand,
      random: commands.randomCommand,
      help: commands.helpCommand,
      stop: commands.stopCommand,
      id: commands.idCommand,
      mylog: commands.myLogCommand,
      admin: commands.adminCommand,
      backupdb: commands.backupDbCommand,
      backupfiles: commands.backupFilesCommand,
      list_users: commands.listUsersCommand,
      stats: commands.statsCommand,
    },
    buttons: uniqueButtons,
    contentCommand: commands.contentCommand,
    userLogCommand: commands.userLogCommand,
    contentDir: env.CONTENT_DIR,
  });
  tgBot.start();
  console.log('🚀 Telegram bot started');
}

// VK
if (env.VK_GROUP_TOKEN && env.VK_GROUP_ID) {
  const vkBot = createUniversalVKBot({
    token: env.VK_GROUP_TOKEN,
    groupId: env.VK_GROUP_ID,
    adminId: env.VK_ADMIN_ID,
    commands: {
      start: commands.startCommand,
      full: commands.fullCommand,
      cat: commands.catCommand,
      quote: commands.quoteCommand,
      advice: commands.adviceCommand,
      random: commands.randomCommand,
      help: commands.helpCommand,
      stop: commands.stopCommand,
      id: commands.idCommand,
      mylog: commands.myLogCommand,
      admin: commands.adminCommand,
      list_users: commands.listUsersCommand,
      stats: commands.statsCommand,
    },
    buttons: uniqueButtons,
    contentCommand: commands.contentCommand,
    userLogCommand: commands.userLogCommand,
    unknownCommandPhrase: phrases.unknownCommand,
    getButtonsForUnknown: () => getButtons(false),
    pool: getPool(),
  });
  vkBot.start();
  console.log('🚀 VK bot started');
}
