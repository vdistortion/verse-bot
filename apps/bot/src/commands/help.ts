import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '../utils/markdown';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  let message = `*\$$ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА\$$*

*||🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.||*

📁 *Доступные команды*:
/${escapeMarkdownV2('start')} — Запустить бота и показать основное меню.
/${escapeMarkdownV2('full')} — Открыть расширенное меню.
/${escapeMarkdownV2('cat')} — Получить случайную картинку котика.
/${escapeMarkdownV2('quote')} — Получить случайную цитату.
/${escapeMarkdownV2('advice')} — Получить случайный совет.
/${escapeMarkdownV2('random')} — Получить случайный контент.
/${escapeMarkdownV2('content')} <номер> — Получить контент по номеру.
/${escapeMarkdownV2('id')} — Показать ваш ID.
/${escapeMarkdownV2('stop')} — Остановить бота.
/${escapeMarkdownV2('help')} — Эта справка.
`;

  if (ctx.platform === 'telegram' && ctx.isAdmin) {
    message += `/${escapeMarkdownV2('backupdb')} — Сделать бэкап базы данных (только для админов).
/${escapeMarkdownV2('list_users')} — Показать список активных пользователей (только для админов).
`;
  } else if (ctx.platform === 'vk' && ctx.isAdmin) {
    message += `/${escapeMarkdownV2('list_users')} — Показать список активных пользователей (только для админов).
`;
  }

  message += `
*🌐 Настройки могут исчезнуть. Это нормально.*
>Система не архивирует. Система не интересуется.
>Система просто работает.

*🔗 Ссылки на других ботов:*
`;

  if (TELEGRAM_BOT_TOKEN && VK_TOKEN) {
    if (ctx.platform === 'telegram') {
      message += `[Бот ВКонтакте](https://vk.com/club${VK_GROUP_ID})`;
    } else if (ctx.platform === 'vk') {
      message += `[Бот в Telegram](https://t.me/${TELEGRAM_BOT_USERNAME})`;
    }
  } else {
    message += `Информация о других ботах недоступна.`;
  }

  await ctx.reply(message);
}
