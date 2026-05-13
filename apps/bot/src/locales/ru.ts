import { format, bold, link, raw, spoiler, type Platform, FormatToken } from '@scope/shared';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_GROUP_TOKEN } from '../env.js';
import { homepage } from '../../../../package.json';

// --- интерфейс команды ---
export interface CommandDef {
  command: string;
  tgDescription?: string;
  button?: string;
  help?: string;
  hidden?: boolean;
  adminOnly?: boolean;
}

// --- объект команд ---
export const commands: Record<string, CommandDef> = {
  start: {
    command: 'start',
    tgDescription: '⌛ Перезапустить. Иногда помогает',
    help: 'Запустить бота и показать основное меню',
  },
  cat: {
    command: 'cat',
    tgDescription: '🐾 Без смысла. Но мило',
    button: '🐾 Котики',
    help: 'Получить случайную картинку котика',
  },
  quote: {
    command: 'quote',
    tgDescription: '💬 Голос из прошлого',
    button: '💬 Цитаты',
    help: 'Получить случайную цитату',
  },
  advice: {
    command: 'advice',
    tgDescription: '💡 Случайный совет',
    button: '💡 Советы',
    help: 'Получить случайный совет',
  },
  random: {
    command: 'random',
    tgDescription: '🎲 Случайный контент',
    button: '🎲 Рандом',
    help: 'Получить случайный контент из базы',
  },
  full: {
    command: 'full',
    hidden: true,
  },
  content: {
    command: 'content',
    hidden: true,
    help: 'Контент по номеру (например, /content_1)',
  },
  help: {
    command: 'help',
    tgDescription: '⚠️ Справка',
    button: '❓ Справка',
    help: 'Показать это сообщение',
  },
  stop: {
    command: 'stop',
    tgDescription: '📡 Забвение',
    help: 'Удалить клавиатуру и забыть вас',
  },
  id: {
    command: 'id',
    tgDescription: '🆔 Мой ID',
    help: 'Показать ваш ID',
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

// --- вспомогательные функции ---
export function setMyCommands() {
  return Object.values(commands)
    .filter((cmd) => !cmd.hidden && !cmd.adminOnly && cmd.tgDescription)
    .map((cmd) => ({ command: cmd.command, description: cmd.tgDescription! }));
}

export function getButtons(fullMenu: boolean) {
  const buttons: { label: string; command: string }[] = [];
  if (commands.cat.button)
    buttons.push({ label: commands.cat.button, command: '/' + commands.cat.command });
  if (commands.quote.button)
    buttons.push({ label: commands.quote.button, command: '/' + commands.quote.command });
  if (fullMenu) {
    if (commands.advice.button)
      buttons.push({ label: commands.advice.button, command: '/' + commands.advice.command });
    if (commands.random.button)
      buttons.push({ label: commands.random.button, command: '/' + commands.random.command });
  }
  if (commands.help.button)
    buttons.push({ label: commands.help.button, command: '/' + commands.help.command });
  return buttons;
}

export function getHelpLines(isAdmin: boolean, platform: Platform): string {
  let lines = '';
  for (const cmd of Object.values(commands)) {
    if (cmd.hidden || !cmd.help) continue;
    if (cmd.adminOnly) continue;
    const cmdText = `/${cmd.command}`;
    lines += `${cmdText} — ${cmd.help}\n`;
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
    mainMenu: (platform: Platform) =>
      platform === 'telegram' ? format(platform)`🐾 ${bold('Главное меню')}` : '🐾 Главное меню',
    fullMenu: (platform: Platform) =>
      platform === 'telegram'
        ? format(platform)`🌟 ${bold('Расширенное меню')}`
        : '🌟 Расширенное меню',
  },

  stop: (platform: Platform) =>
    platform === 'telegram'
      ? format(platform)`👋 Пока! Если что — /start чтобы вернуться.`
      : '👋 Пока! Если что — /start чтобы вернуться.',

  help: {
    getMessage: ({
      platform,
      isAdmin,
      chatType,
    }: {
      platform: Platform;
      isAdmin: boolean;
      chatType: string;
    }) => {
      const f = format(platform);
      const repoUrl = homepage;
      const vkGroupLink = VK_GROUP_TOKEN ? VK_GROUP_ID : undefined;
      const tgUsername = TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_USERNAME : undefined;
      const header = f`${bold('[ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА]')}\n\n${spoiler('🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.')}\n\n📁 ${bold('Доступные команды')}:\n${raw(getHelpLines(isAdmin, platform))}`;

      const links = [];
      if (platform === 'telegram' && vkGroupLink) {
        links.push(link('Бот ВКонтакте', `https://vk.com/club${vkGroupLink}`));
      } else if (platform !== 'telegram' && tgUsername) {
        links.push(`Бот в Telegram: https://t.me/${tgUsername}`);
      }
      const renderedLinks = links.map((l) => (l instanceof FormatToken ? l.render(platform) : l));
      const linksSection = renderedLinks.length
        ? f`\n\n🔗 ${bold('Ссылки')}:\n${raw(renderedLinks.join('\n'))}`
        : '';

      const footer = f`\n${link('Исходный код', repoUrl)}\n\n${bold('[СИСТЕМА ЗАВЕРШИЛА ВЫВОД]')}`;

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
        // VK
        return (
          format(platform)`👑 Административные команды:\n` +
          `/list_users – 👥 Список активных пользователей\n` +
          `/stats – 📊 Статистика команд\n` +
          `/userlog_${userIdPlaceholder} – 📋 Логи пользователя`
        );
      }
    },
    notAdmin: (platform: Platform) =>
      format(platform)`⛔ У вас нет прав для выполнения этой команды.`,
    notPrivate: (platform: Platform) =>
      format(platform)`Команда доступна только в личных сообщениях с ботом.`,
  },

  id: {
    message: (platform: Platform, userId: string) =>
      format(platform)`🆔 Ваш ID: ${userId}\n📍 Платформа: ${platform}`,
    chatId: (platform: Platform, chatId: number | string) =>
      platform === 'telegram'
        ? format(platform)`🆔 ${bold('ID чата:')} \`${String(chatId)}\``
        : format(platform)`🆔 ID чата: ${String(chatId)}`,
  },

  cat: {
    caption: (platform: Platform) => format(platform)`Мяу! 🐾`,
    notFound: (platform: Platform) => format(platform)`Кот убежал в сервера. Попробуй позже 🐾`,
  },

  random: {
    emptyDb: (platform: Platform) => format(platform)`В базе данных нет контента.`,
    error: (platform: Platform) =>
      format(platform)`❌ Произошла ошибка при получении случайного контента.`,
    dbUnavailable: (platform: Platform) => format(platform)`❌ База данных недоступна.`,
  },

  content: {
    notFound: (platform: Platform, number: number, total: number) =>
      format(
        platform,
      )`Контент с номером ${String(number)} не найден. Всего элементов: ${String(total)}.`,
    commandHint: (platform: Platform, number: number) =>
      format(platform)`/content_${String(number)}`,
    dbUnavailable: (platform: Platform) => format(platform)`❌ База данных недоступна.`,
    emptyDb: (platform: Platform) => format(platform)`В базе данных нет контента.`,
    error: (platform: Platform) => format(platform)`❌ Произошла ошибка при получении контента.`,
    invalidNumber: (platform: Platform) =>
      format(platform)`Пожалуйста, укажите корректный номер контента. Например: /content_1`,
  },

  backupDb: {
    start: (platform: Platform) => format(platform)`⏳ Запускаю создание бэкапа...`,
    success: (platform: Platform) => format(platform)`Вот ваш полный бэкап базы данных 💾`,
    error: (platform: Platform) => format(platform)`❌ Произошла ошибка при создании бэкапа.`,
    notAdmin: (platform: Platform) =>
      format(platform)`⛔ У вас нет прав для выполнения этой команды.`,
    notPrivate: (platform: Platform) =>
      format(platform)`Команда доступна только в личных сообщениях с ботом.`,
    unsupported: (platform: Platform) =>
      format(platform)`❌ Отправка файлов бэкапа не поддерживается на этой платформе.`,
  },

  listUsers: {
    loading: (platform: Platform) => format(platform)`Загружаю список пользователей...`,
    empty: (platform: Platform) => format(platform)`В базе данных нет активных пользователей.`,
    header: (platform: Platform, count: number) =>
      format(platform)`${bold(`👥 Список активных пользователей (${count}):`)}`,
    error: (platform: Platform) =>
      format(platform)`❌ Произошла ошибка при получении списка пользователей.`,
    notAdmin: (platform: Platform) =>
      format(platform)`⛔ У вас нет прав для выполнения этой команды.`,
    notPrivate: (platform: Platform) =>
      format(platform)`Команда доступна только в личных сообщениях с ботом.`,
  },

  unknownCommand: (platform: Platform) => format(platform)`❓ Неизвестная команда`,
  errorDefault: (platform: Platform) => format(platform)`❌ Произошла ошибка.`,
};
