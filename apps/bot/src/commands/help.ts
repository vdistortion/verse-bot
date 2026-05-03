import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';
import { homepage } from '../../../../package.json';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  const isTg = ctx.platform === 'telegram';

  let message = isTg
    ? `*ИНТЕРФЕЙС БОТА\\. ВЕРСИЯ ЗАБЫТА*

*||🤖 Этот бот — пережиток\\. Он всё ещё работает\\. Без цели\\.||*

📁 *Доступные команды*:
${escapeMarkdownV2('/start — Запустить бота и показать основное меню.')}
${escapeMarkdownV2('/full — Открыть расширенное меню.')}
${escapeMarkdownV2('/cat — Получить случайную картинку котика.')}
${escapeMarkdownV2('/quote — Получить случайную цитату.')}
${escapeMarkdownV2('/advice — Получить случайный совет.')}
${escapeMarkdownV2('/random — Получить случайный контент.')}
${escapeMarkdownV2('/content_1 — Получить контент по номеру.')}
${escapeMarkdownV2('/id — Показать ваш ID.')}
${escapeMarkdownV2('/stop — Остановить бота.')}
${escapeMarkdownV2('/help — Эта справка.')}`
    : `ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА

🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.

📁 Доступные команды:
/start — Запустить бота и показать основное меню.
/full — Открыть расширенное меню.
/cat — Получить случайную картинку котика.
/quote — Получить случайную цитату.
/advice — Получить случайный совет.
/random — Получить случайный контент.
/content_1 — Получить контент по номеру.
/id — Показать ваш ID.
/stop — Остановить бота.
/help — Эта справка.`;

  if (ctx.isAdmin && ctx.chatType === 'private') {
    message += isTg
      ? escapeMarkdownV2(
          `\n/admin — Административные команды.\n/backupdb — Бэкап БД\n/list_users — Список активных пользователей.`,
        )
      : `\n/admin — Административные команды.\n/list_users — Список активных пользователей.`;
  }

  message += isTg ? `\n\n🔗 *Ссылки:*\n` : `\n\n🔗 Ссылки:\n`;

  if (isTg && VK_TOKEN && VK_GROUP_ID) {
    message += `[Бот ВКонтакте](https://vk.com/club${VK_GROUP_ID})`;
  } else if (!isTg && TELEGRAM_BOT_TOKEN) {
    message += `Бот в Telegram: https://t.me/${TELEGRAM_BOT_USERNAME}`;
  }

  message += `${isTg ? `\n[Исходный код](${escapeMarkdownV2(homepage)})` : `\nИсходный код: ${homepage}`}`;

  await ctx.reply(message, {
    link_preview_options: { is_disabled: true },
  });
}
