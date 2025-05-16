import { type Context, Input } from 'telegraf';
import type { ParseMode } from '@telegraf/types/message';
import type { KeyboardButton } from '@telegraf/types/markup';

export const reply = (
  ctx: Context,
  text: string,
  options?: {
    messageId?: number;
    parseMode?: ParseMode;
    keyboard?: KeyboardButton[][];
  },
) => {
  return ctx.reply(text, {
    ...(options?.messageId && {
      reply_parameters: { message_id: options.messageId },
    }),
    ...(options?.parseMode && { parse_mode: options.parseMode }),
    ...(options?.keyboard && {
      reply_markup: {
        keyboard: options.keyboard,
        resize_keyboard: true,
      },
    }),
  });
};

export const replyWithPhoto = (ctx: Context, url: string) => ctx.replyWithPhoto(Input.fromURL(url));
