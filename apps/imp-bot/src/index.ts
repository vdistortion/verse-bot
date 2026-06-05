import { initPool, getPool } from '@verse-bot/db';
import { createUniversalTelegramBot } from '@verse-bot/tg-core';
import { createUniversalVKBot } from '@verse-bot/vk-core';
import {
  CONTENT_DIR,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_USER,
  TELEGRAM_ADMIN_ID,
  TELEGRAM_BOT_TOKEN,
  VK_ADMIN_ID,
  VK_GROUP_ID,
  VK_GROUP_TOKEN,
} from './env.js';
import {
  adminCommand,
  adviceCommand,
  backupDbCommand,
  backupFilesCommand,
  catCommand,
  contentCommand,
  helpCommand,
  idCommand,
  listUsersCommand,
  myLogCommand,
  quoteCommand,
  randomCommand,
  startCommand,
  statsCommand,
  stopCommand,
  userLogCommand,
} from './commands/index.js';
import { phrases, getButtons } from './locales/ru.js';

initPool({
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  port: 5432,
});

const allPossibleButtonsForRegistration = getButtons(true).map((b) => ({
  command: b.command.replace('/', ''),
  label: b.label,
}));

// Уникальные кнопки
const uniqueButtonsForRegistration = Array.from(
  new Map(allPossibleButtonsForRegistration.map((b) => [b.command + b.label, b])).values(),
);

// Telegram
if (TELEGRAM_BOT_TOKEN) {
  const tgBot = createUniversalTelegramBot({
    token: TELEGRAM_BOT_TOKEN,
    adminId: TELEGRAM_ADMIN_ID,
    commands: {
      start: startCommand,
      cat: catCommand,
      quote: quoteCommand,
      advice: adviceCommand,
      random: randomCommand,
      help: helpCommand,
      stop: stopCommand,
      id: idCommand,
      mylog: myLogCommand,
      admin: adminCommand,
      backupdb: backupDbCommand,
      backupfiles: backupFilesCommand,
      list_users: listUsersCommand,
      stats: statsCommand,
    },
    buttons: uniqueButtonsForRegistration,
    contentCommand: contentCommand,
    userLogCommand: userLogCommand,
    contentDir: CONTENT_DIR,
  });
  tgBot.start();
  console.log('🚀 Telegram bot started');
}

// VK
if (VK_GROUP_TOKEN && VK_GROUP_ID) {
  const vkBot = createUniversalVKBot({
    token: VK_GROUP_TOKEN,
    groupId: VK_GROUP_ID,
    adminId: VK_ADMIN_ID,
    commands: {
      start: startCommand,
      cat: catCommand,
      quote: quoteCommand,
      advice: adviceCommand,
      random: randomCommand,
      help: helpCommand,
      stop: stopCommand,
      id: idCommand,
      mylog: myLogCommand,
      admin: adminCommand,
      list_users: listUsersCommand,
      stats: statsCommand,
    },
    buttons: uniqueButtonsForRegistration,
    contentCommand: contentCommand,
    userLogCommand: userLogCommand,
    unknownCommandPhrase: phrases.unknownCommand,
    getButtonsForUnknown: () => getButtons(false),
    pool: getPool(),
  });
  vkBot.start();
  console.log('🚀 VK bot started');
}
