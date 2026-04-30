import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';

export async function linkBotCommand(ctx: UniversalContext): Promise<void> {
  let message =
    ctx.platform === 'telegram' ? `🔗 *Ссылки на других ботов*:\n` : `🔗 Ссылки на других ботов:\n`;

  if (TELEGRAM_BOT_TOKEN && VK_TOKEN) {
    if (ctx.platform === 'telegram') {
      message += `\n[Бот ВКонтакте](https://vk.com/club${VK_GROUP_ID})`;
    } else if (ctx.platform === 'vk') {
      message += `\nБот в Telegram: https://t.me/${TELEGRAM_BOT_USERNAME}`;
    }
  } else {
    message +=
      ctx.platform === 'telegram'
        ? escapeMarkdownV2(`\nИнформация о других ботах недоступна.`)
        : `\nИнформация о других ботах недоступна.`;
  }

  await ctx.reply(message);
}
