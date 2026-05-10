import { format, bold, link, raw, spoiler, type Platform, FormatToken } from '@scope/shared';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';
import { homepage } from '../../../../package.json';

function commandsList(platform: Platform): string {
  const cmds = [
    '/start — Запустить бота и показать основное меню',
    '/full — Открыть расширенное меню',
    '/cat — Получить случайную картинку котика',
    '/quote — Получить случайную цитату',
    '/advice — Получить случайный совет',
    '/random — Получить случайный контент',
    '/content\\_1 — Получить контент по номеру',
    '/id — Показать ваш ID',
    '/stop — Остановить бота',
    '/help — Эта справка',
  ];
  return platform === 'telegram'
    ? cmds.join('\n')
    : cmds.map((c) => c.replace(/\\_/g, '_')).join('\n');
}

const adminCommandsTg = [
  '/admin — Административные команды',
  '/backupdb — Бэкап БД',
  '/list_users — Список активных пользователей',
].join('\n');

const adminCommandsVk = [
  '/admin — Административные команды',
  '/list_users — Список активных пользователей',
].join('\n');

export const phrases = {
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
      const vkGroupLink = VK_TOKEN ? VK_GROUP_ID : undefined;
      const tgUsername = TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_USERNAME : undefined;
      const header = f`${bold('[ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА]')}\n\n${spoiler('🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.')}\n\n📁 ${bold('Доступные команды')}:\n${raw(commandsList(platform))}`;

      const adminBlock =
        isAdmin && chatType === 'private'
          ? f`\n${raw(platform === 'telegram' ? adminCommandsTg : adminCommandsVk)}`
          : '';

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

      return f`${raw(header)}${adminBlock}${raw(linksSection)}${raw(footer)}`;
    },
  },

  admin: {
    message: (platform: Platform) => {
      if (platform === 'telegram') {
        const tgCmds =
          '/backupdb – 💾 Сделать бэкап базы данных\n/list\\_users – 👥 Список активных пользователей';
        return format(platform)`👑 ${bold('Административные команды:')}\n${raw(tgCmds)}`;
      } else {
        return format(
          platform,
        )`👑 Административные команды:\n/list_users – 👥 Список активных пользователей`;
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
