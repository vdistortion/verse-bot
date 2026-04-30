import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  let message =
    ctx.platform === 'telegram'
      ? `*ИНТЕРФЕЙС БОТА\\. ВЕРСИЯ ЗАБЫТА*

*||🤖 Этот бот — пережиток\\. Он всё ещё работает\\. Без цели\\.||*

📁 *Доступные команды*:
${escapeMarkdownV2(`/start — Запустить бота и показать основное меню.
/full — Открыть расширенное меню.
/cat — Получить случайную картинку котика.
/quote — Получить случайную цитату.
/advice — Получить случайный совет.
/random — Получить случайный контент.
/content <номер> — Получить контент по номеру.
/id — Показать ваш ID.
/stop — Остановить бота.
/help — Эта справка.`)}
`
      : `ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА

🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.

📁 Доступные команды:
/start — Запустить бота и показать основное меню.
/full — Открыть расширенное меню.
/cat — Получить случайную картинку котика.
/quote — Получить случайную цитату.
/advice — Получить случайный совет.
/random — Получить случайный контент.
/content <номер> — Получить контент по номеру.
/id — Показать ваш ID.
/stop — Остановить бота.
/help — Эта справка.
`;

  if (ctx.platform === 'telegram' && ctx.isAdmin) {
    message += escapeMarkdownV2(
      `/backupdb — Бэкап БД\n/list_users — Список активных пользователей.\n`,
    );
  } else if (ctx.platform === 'vk' && ctx.isAdmin) {
    message += `/list_users — Список активных пользователей.\n`;
  }

  message += ctx.platform === 'telegram' ? `\n🔗 *Ссылки\\:*\n` : `\n🔗 Ссылки:\n`;

  if (TELEGRAM_BOT_TOKEN && VK_TOKEN) {
    if (ctx.platform === 'telegram') {
      message += `[Бот ВКонтакте](https://vk\\.com/club${VK_GROUP_ID})`;
    } else if (ctx.platform === 'vk') {
      message += `Бот в Telegram: https://t.me/${TELEGRAM_BOT_USERNAME}`;
    }
  } else {
    message +=
      ctx.platform === 'telegram' ? escapeMarkdownV2(`Ссылки недоступны`) : `Ссылки недоступны`;
  }

  await ctx.reply(message);
}
