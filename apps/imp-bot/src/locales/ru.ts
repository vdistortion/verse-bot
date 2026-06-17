import type { FormatFn, Platform, RichMessage, UniversalKeyboardButton } from '@verse-bot/core';
import { bold, code, link, spoiler } from 'tg-rich-messages';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_GROUP_TOKEN } from '../env.js';

type Format = FormatFn;

export interface CommandDef {
  command: string;
  tgDescription?: string;
  button?: string;
  help?: string;
  hidden?: boolean;
  adminOnly?: boolean;
}

export const commands: Record<string, CommandDef> = {
  start: {
    command: 'start',
    tgDescription: '⌛ Перезапустить. Иногда помогает',
    help: '⌛ Перезапустить. Иногда помогает',
  },
  cat: {
    command: 'cat',
    tgDescription: '🐾 Без смысла. Но мило',
    button: '🐾 Без смысла. Но мило',
    help: '🧶 За котиком. Не твоим. Не настоящим',
  },
  quote: {
    command: 'quote',
    tgDescription: '💬 Голос из прошлого',
    button: '💬 Голос из прошлого',
    help: '🗯 Вербальные фрагменты прошлых поколений',
  },
  advice: {
    command: 'advice',
    button: '🧨 Отмочить',
    help: '⚠️ Нестабильно',
  },
  random: {
    command: 'random',
    button: '🎲 Рандом',
    help: 'Источник неизвестен',
  },
  content: {
    command: 'content',
    hidden: true,
    help: 'Контент по номеру (например, /content_1)',
  },
  help: {
    command: 'help',
    tgDescription: '⚠️ Справка',
    button: '⚠️ Справка',
    help: '⚠️ Справка. Для тех, кто всё ещё ищет порядок',
  },
  stop: {
    command: 'stop',
    tgDescription: '📡 Забвение',
    help: '📡 Всё исчезает. Сигналов нет. Забвение',
  },
  id: {
    command: 'id',
    tgDescription: '🆔 Мой ID',
    help: '🆔 Показать ваш ID',
  },
  mylog: {
    command: 'mylog',
    tgDescription: '📋 Мои действия',
    help: 'Последние выполненные команды',
  },
  admin: {
    command: 'admin',
    adminOnly: true,
    help: 'Административные команды',
  },
  backupdb: {
    command: 'backupdb',
    adminOnly: true,
    help: 'Создать полный бэкап базы',
  },
  backupfiles: {
    command: 'backupfiles',
    adminOnly: true,
    help: 'Создать бэкап файлов контента',
  },
  list_users: {
    command: 'list_users',
    adminOnly: true,
    help: 'Список всех пользователей',
  },
  stats: {
    command: 'stats',
    adminOnly: true,
    help: 'Статистика использования команд',
  },
  userlog: {
    command: 'userlog',
    adminOnly: true,
    hidden: true,
    help: 'Логи конкретного пользователя',
  },
};

export function getButtons(fullMenu: boolean) {
  const buttons: { label: string; command: string }[] = [];
  if (commands.quote.button)
    buttons.push({ label: commands.quote.button, command: '/' + commands.quote.command });
  if (commands.cat.button)
    buttons.push({ label: commands.cat.button, command: '/' + commands.cat.command });
  if (fullMenu) {
    if (commands.random.button)
      buttons.push({ label: commands.random.button, command: '/' + commands.random.command });
    if (commands.advice.button)
      buttons.push({ label: commands.advice.button, command: '/' + commands.advice.command });
  }
  return buttons;
}

export function getInlineButton(command: string, label: string): UniversalKeyboardButton[][] {
  return [[{ label, command: `/${command}` }]];
}

export function getHelpLines(): string {
  let lines = '';
  for (const cmd of Object.values(commands)) {
    if (cmd.hidden || !cmd.help) continue;
    if (cmd.adminOnly) continue;
    if (cmd.command === 'random' && Math.random() < 0.2) continue;
    if (cmd.command === 'advice' && Math.random() < 0.1) continue;
    const cmdText = `/${cmd.command}`;
    lines += `${cmdText} — ${cmd.help}\n`;
  }
  return lines;
}

export const phrases = {
  commands,
  start: {
    personal: (fmt: Format, firstName: string) => fmt`Будь как дома, ${firstName}...`,
    group: (fmt: Format, title: string) => fmt`Группа ${title} подключена к системе.`,
  },

  stop: (fmt: Format) => fmt`Всё забыто...`,

  help: {
    getMessage: (fmt: Format, platform: Platform) => {
      const vkGroupLink = VK_GROUP_TOKEN ? VK_GROUP_ID : undefined;
      const tgUsername = TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_USERNAME : undefined;
      const header = fmt`${bold('[ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА]')}\n\n${spoiler('🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.')}\n\n📁 ${bold('Команды работают, смысл утрачен')}:\n${getHelpLines()}`;

      const sourceCode = link('Исходный код', 'https://github.com/vdistortion/verse-bot');
      let linksSection: RichMessage;
      if (platform === 'telegram' && vkGroupLink) {
        const botVk = link('Бот ВКонтакте', `https://vk.com/club${vkGroupLink}`);
        linksSection = fmt`\n🔗 ${bold('Ссылки')}:\n${botVk} — Не обязательно использовать\n${sourceCode} — Не обязательно понимать.`;
      } else if (platform !== 'telegram' && tgUsername) {
        const botTg = link('Бот в Telegram', `https://t.me/${tgUsername}`);
        linksSection = fmt`\n🔗 ${bold('Ссылки')}:\n${botTg} — Не обязательно использовать\n${sourceCode} — Не обязательно понимать.`;
      } else {
        linksSection = fmt`\n🔗 ${bold('Ссылки')}:\n${sourceCode} — Не обязательно понимать.`;
      }

      const footer = fmt`\n\n${spoiler('Система не архивирует. Система не интересуется. Система просто работает.')}\n\n${bold('[СИСТЕМА ЗАВЕРШИЛА ВЫВОД]')}`;

      return fmt`${header}${linksSection}${footer}`;
    },
  },

  admin: {
    message: (fmt: Format, platform: Platform, dbUserId?: number) => {
      const userIdPlaceholder = dbUserId !== undefined ? String(dbUserId) : '<id>';
      if (platform === 'telegram') {
        const tgCmds =
          `/backupdb – 💾 Сделать бэкап базы данных\n` +
          `/backupfiles – 📦 Бэкап файлов контента\n` +
          `/list\\_users – 👥 Список активных пользователей\n` +
          `/stats – 📊 Статистика команд\n` +
          `/userlog\\_${userIdPlaceholder} – 📋 Логи пользователя`;
        return fmt`👑 ${bold('Административные команды:')}\n${tgCmds}`;
      } else {
        return fmt`
👑 Административные команды:
${`/list_users – 👥 Список активных пользователей
/stats – 📊 Статистика команд
/userlog_${userIdPlaceholder} – 📋 Логи пользователя`}
`;
      }
    },
  },

  id: {
    message: (fmt: Format, userId: string) =>
      fmt`🆔 ${bold('Ваш бесполезный ID:')} ${code(String(userId))}`,
    chatId: (fmt: Format, chatId: number | string) =>
      fmt`🆔 ${bold('ID чата:')} ${code(String(chatId))}`,
  },

  cat: {
    caption: (fmt: Format) => fmt`Мяу! 🐾`,
    notFound: (fmt: Format) => fmt`Кот убежал в сервера. Попробуй позже 🐾`,
  },

  contentHint: (_fmt: Format, number: number) => `/content_${String(number)}`,

  unknownCommand: (fmt: Format) =>
    fmt`Команда потеряна, контекст утрачен.\nПопробуй /start. Или не пробуй.\nСистема всё равно одинока.`,
  errorDefault: (fmt: Format) => fmt`⚠️ Настройки нестабильны`,
};
