import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export const phrases = {
  start: {
    personal: (firstName: string) => `Будь как дома, ${firstName}...`,
    group: (title: string) => `Группа ${title} подключена к системе.`,
    mainMenu: '🐾 Главное меню',
    fullMenu: '🌟 Расширенное меню',
    mainMenuTg: '🐾 *Главное меню*',
    fullMenuTg: '🌟 *Расширенное меню*',
  },
  stopMessage: '👋 Пока\\! Если что — /start чтобы вернуться\\.',
  stop: '👋 Пока! Если что — /start чтобы вернуться.',
  help: {
    getMessage: ({
      isTg,
      isAdmin,
      chatType,
      vkGroupLink,
      tgUsername,
      repoUrl,
    }: {
      isTg: boolean;
      isAdmin: boolean;
      chatType: string;
      vkGroupLink?: string;
      tgUsername?: string;
      repoUrl: string;
    }) => {
      const commandsTg = `/start — Запустить бота и показать основное меню\\.
/full — Открыть расширенное меню\\.
/cat — Получить случайную картинку котика\\.
/quote — Получить случайную цитату\\.
/advice — Получить случайный совет\\.
/random — Получить случайный контент\\.
/content\\_1 — Получить контент по номеру\\.
/id — Показать ваш ID\\.
/stop — Остановить бота\\.
/help — Эта справка\\.`;

      const commandsVk = `/start — Запустить бота и показать основное меню.
/full — Открыть расширенное меню.
/cat — Получить случайную картинку котика.
/quote — Получить случайную цитату.
/advice — Получить случайный совет.
/random — Получить случайный контент.
/content_1 — Получить контент по номеру.
/id — Показать ваш ID.
/stop — Остановить бота.
/help — Эта справка.`;

      let message = isTg
        ? `*\\[ИНТЕРФЕЙС БОТА\\. ВЕРСИЯ ЗАБЫТА\\]*

*||🤖 Этот бот — пережиток\\. Он всё ещё работает\\. Без цели\\.||*

📁 *Доступные команды*:
${commandsTg}`
        : `[ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА]

🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.

📁 Доступные команды:
${commandsVk}`;

      if (isAdmin && chatType === 'private') {
        const adminCommandsTg = `\n\n/admin — Административные команды\\.
/backupdb — Бэкап БД
/list\\_users — Список активных пользователей\\.`;
        const adminCommandsVk = `\n\n/admin — Административные команды.\n/list_users — Список активных пользователей.`;

        message += isTg ? adminCommandsTg : adminCommandsVk;
      }

      message += isTg ? `\n\n🔗 *Ссылки:*\n` : `\n\n🔗 Ссылки:\n`;

      if (isTg && vkGroupLink) {
        message += `[Бот ВКонтакте](https://vk.com/club${escapeMarkdownV2(vkGroupLink)})`;
      } else if (!isTg && tgUsername) {
        message += `Бот в Telegram: https://t.me/${tgUsername}`;
      }

      message += isTg
        ? `\n[Исходный код](${escapeMarkdownV2(repoUrl)})\n\n*\\[СИСТЕМА ЗАВЕРШИЛА ВЫВОД\\]*`
        : `\nИсходный код: ${repoUrl}\n\n[СИСТЕМА ЗАВЕРШИЛА ВЫВОД]`;

      return message;
    },
  },
  admin: {
    message: (isTg: boolean) =>
      isTg
        ? `👑 *Административные команды:*
/backupdb – 💾 Сделать бэкап базы данных
/list\\_users – 👥 Список активных пользователей`
        : `👑 Административные команды:
/list_users – 👥 Список активных пользователей`,
    notAdmin: '⛔ У вас нет прав для выполнения этой команды\\.',
    notPrivate: 'Команда доступна только в личных сообщениях с ботом\\.',
  },
  id: {
    message: (platform: string, userId: string) =>
      `🆔 Ваш ID: ${userId}\n📍 Платформа: ${platform}`,
    messageTg: (platform: string, userId: string) =>
      `🆔 *Ваш ID:* \`${escapeMarkdownV2(userId)}\`\n📍 *Платформа:* ${platform}`,
    chatId: (isTg: boolean, chatId: number | string) =>
      isTg ? `🆔 *ID чата:* \`${escapeMarkdownV2(String(chatId))}\`` : `🆔 ID чата: ${chatId}`,
  },
  cat: {
    caption: 'Мяу! 🐾',
    notFound: 'Кот убежал в сервера\\. Попробуй позже 🐾',
  },
  random: {
    emptyDb: 'В базе данных нет контента\\.',
    error: '❌ Произошла ошибка при получении случайного контента\\.',
    dbUnavailable: '❌ База данных недоступна\\.',
  },
  content: {
    notFound: (number: number, total: number) =>
      `Контент с номером ${escapeMarkdownV2(String(number))} не найден\\. Всего элементов: ${escapeMarkdownV2(String(total))}\\.`,
    commandHint: (number: number) => `/content_${escapeMarkdownV2(String(number))}`,
    dbUnavailable: '❌ База данных недоступна\\.',
    emptyDb: 'В базе данных нет контента\\.',
    error: '❌ Произошла ошибка при получении контента\\.',
    invalidNumber: 'Пожалуйста, укажите корректный номер контента\\. Например: /content_1',
  },
  backupDb: {
    start: '⏳ Запускаю создание бэкапа\\.\\.',
    success: 'Вот ваш полный бэкап базы данных 💾',
    error: '❌ Произошла ошибка при создании бэкапа\\.',
    notAdmin: '⛔ У вас нет прав для выполнения этой команды\\.',
    notPrivate: 'Команда доступна только в личных сообщениях с ботом\\.',
    unsupported: '❌ Отправка файлов бэкапа не поддерживается на этой платформе\\.',
  },
  listUsers: {
    loading: 'Загружаю список пользователей...',
    empty: 'В базе данных нет активных пользователей\\.',
    header: (count: number) => `👥 Список активных пользователей (${String(count)}):`,
    error: '❌ Произошла ошибка при получении списка пользователей\\.',
    notAdmin: '⛔ У вас нет прав для выполнения этой команды\\.',
    notPrivate: 'Команда доступна только в личных сообщениях с ботом\\.',
  },
  unknownCommand: '❓ Неизвестная команда',
  errorDefault: '❌ Произошла ошибка\\.',
};
