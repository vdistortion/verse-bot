import {
  format,
  bold,
  code,
  link,
  raw,
  spoiler,
  type Platform,
  FormatToken,
  type UniversalKeyboardButton,
} from '@verse-bot/shared';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_GROUP_TOKEN } from '../env.js';

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

export function getHelpLines(platform: Platform): string {
  let lines = '';
  for (const cmd of Object.values(commands)) {
    if (cmd.hidden || !cmd.help) continue;
    if (cmd.adminOnly) continue;
    if (cmd.command === 'random' && Math.random() < 0.2) continue;
    if (cmd.command === 'advice' && Math.random() < 0.1) continue;
    const cmdText = `/${cmd.command}`;
    lines += format(platform)`${cmdText} — ${cmd.help}\n`;
  }
  return lines;
}

export const phrases = {
  commands,
  start: {
    personal: (platform: Platform, firstName: string) =>
      format(platform)`Будь как дома, ${firstName}...`,
    group: (platform: Platform, title: string) =>
      format(platform)`Группа ${title} подключена к системе.`,
  },

  stop: (platform: Platform) => format(platform)`Всё забыто...`,

  help: {
    getMessage: (platform: Platform) => {
      const f = format(platform);
      const vkGroupLink = VK_GROUP_TOKEN ? VK_GROUP_ID : undefined;
      const tgUsername = TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_USERNAME : undefined;
      const header = f`${bold('[ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА]')}\n\n${spoiler('🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.')}\n\n📁 ${bold('Команды работают, смысл утрачен')}:\n${raw(getHelpLines(platform))}`;

      const renderedLinks = [];
      if (platform === 'telegram' && vkGroupLink) {
        const botVk = link('Бот ВКонтакте', `https://vk.com/club${vkGroupLink}`);
        renderedLinks.push(f`${botVk} — Не обязательно использовать`);
      } else if (platform !== 'telegram' && tgUsername) {
        const botTg = link('Бот в Telegram', `https://t.me/${tgUsername}`);
        renderedLinks.push(f`${botTg} — Не обязательно использовать`);
      }
      renderedLinks.push(
        f`${link('Исходный код', 'https://github.com/vdistortion/verse-bot')} — Не обязательно понимать.`,
      );
      const linksSection = renderedLinks.length
        ? f`\n🔗 ${bold('Ссылки')}:\n${raw(renderedLinks.join('\n'))}`
        : '';

      const footer = f`\n\n${spoiler('Система не архивирует. Система не интересуется. Система просто работает.')}\n\n${bold('[СИСТЕМА ЗАВЕРШИЛА ВЫВОД]')}`;

      return f`${raw(header)}${raw(linksSection)}${raw(footer)}`;
    },
  },

  admin: {
    message: (platform: Platform, dbUserId?: number) => {
      const userIdPlaceholder = dbUserId !== undefined ? String(dbUserId) : '<id>';
      if (platform === 'telegram') {
        const tgCmds =
          `/backupdb – 💾 Сделать бэкап базы данных\n` +
          `/backupfiles – 📦 Бэкап файлов контента\n` +
          `/list\\_users – 👥 Список активных пользователей\n` +
          `/stats – 📊 Статистика команд\n` +
          `/userlog\\_${userIdPlaceholder} – 📋 Логи пользователя`;
        return format(platform)`👑 ${bold('Административные команды:')}\n${raw(tgCmds)}`;
      } else {
        return (
          format(platform)`👑 Административные команды:\n` +
          `/list_users – 👥 Список активных пользователей\n` +
          `/stats – 📊 Статистика команд\n` +
          `/userlog_${userIdPlaceholder} – 📋 Логи пользователя`
        );
      }
    },
  },

  id: {
    message: (platform: Platform, userId: string) =>
      format(platform)`🆔 ${bold('Ваш бесполезный ID:')} ${code(String(userId))}`,
    chatId: (platform: Platform, chatId: number | string) =>
      format(platform)`🆔 ${bold('ID чата:')} ${code(String(chatId))}`,
  },

  cat: {
    caption: (platform: Platform) => format(platform)`Мяу! 🐾`,
    notFound: (platform: Platform) => format(platform)`Кот убежал в сервера. Попробуй позже 🐾`,
  },

  contentHint: (platform: Platform, number: number) => format(platform)`/content_${String(number)}`,

  unknownCommand: (platform: Platform) =>
    format(
      platform,
    )`Команда потеряна, контекст утрачен.\nПопробуй /start. Или не пробуй.\nСистема всё равно одинока.`,
  errorDefault: (platform: Platform) => format(platform)`⚠️ Настройки нестабильны`,
};
