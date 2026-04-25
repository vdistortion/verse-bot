import type { UniversalContext } from '@scope/shared';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  let message = `*\$$ИНТЕРФЕЙС БОТА\\. ВЕРСИЯ ЗАБЫТА\$$*

*||🤖 Этот бот — пережиток\\. Он всё ещё работает\\. Без цели\\.||*

📁 *Доступные команды*:
/start — Запустить бота и показать основное меню\\.
/full — Открыть расширенное меню\\.
/cat — Получить случайную картинку котика\\.
/quote — Получить случайную цитату\\.
/advice — Получить случайный совет\\.
/random — Получить случайный контент\\.
/content <номер\\> — Получить контент по номеру\\.
/id — Показать ваш ID\\.
/stop — Остановить бота\\.
/help — Эта справка\\.
`;

  if (ctx.platform === 'telegram' && ctx.isAdmin) {
    message += `/backupdb — Бэкап БД\n/list\\_users — Список активных пользователей\n`;
  } else if (ctx.platform === 'vk' && ctx.isAdmin) {
    message += `/list_users — Список активных пользователей\n`;
  }

  message += `\n*🔗 Ссылки:*\n`;

  if (TELEGRAM_BOT_TOKEN && VK_TOKEN) {
    if (ctx.platform === 'telegram') {
      message += `[VK бот](https://vk\\.com/club${VK_GROUP_ID})`;
    } else if (ctx.platform === 'vk') {
      message += `[Telegram бот](https://t\\.me/${TELEGRAM_BOT_USERNAME})`;
    }
  } else {
    message += `Ссылки недоступны`;
  }

  await ctx.reply(message);
}
