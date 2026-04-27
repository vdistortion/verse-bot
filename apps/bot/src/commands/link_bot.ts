import type { UniversalContext } from '@scope/shared';
import { TELEGRAM_BOT_TOKEN, VK_TOKEN } from '../env';

export async function linkBotCommand(ctx: UniversalContext): Promise<void> {
  let message = `🔗 *Ссылки на других ботов*:
`;

  if (TELEGRAM_BOT_TOKEN && VK_TOKEN) {
    if (ctx.platform === 'telegram') {
      message += `
[Бот ВКонтакте](https://vk.com/club${process.env.VK_GROUP_ID})
`;
    } else if (ctx.platform === 'vk') {
      message += `
[Бот в Telegram](https://t.me/${process.env.TELEGRAM_BOT_USERNAME})
`;
    }
  } else {
    message += `
Информация о других ботах недоступна.
`;
  }

  await ctx.reply(message);
}
