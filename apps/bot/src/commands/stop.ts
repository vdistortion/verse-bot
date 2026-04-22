import type { UniversalContext, UniversalReplyOptions } from '@scope/shared';
import type { ReplyKeyboardRemove } from 'grammy/types';

export async function stopCommand(ctx: UniversalContext): Promise<void> {
  const replyOptions: UniversalReplyOptions = {};

  if (ctx.platform === 'telegram') {
    replyOptions.telegramReplyMarkup = { remove_keyboard: true } as ReplyKeyboardRemove;
  } else if (ctx.platform === 'vk') {
    replyOptions.vkKeyboard = JSON.stringify({ buttons: [] }); // Пустая клавиатура для VK
  }

  await ctx.reply('Бот остановлен. Чтобы запустить снова, используйте /start.', replyOptions);
}
