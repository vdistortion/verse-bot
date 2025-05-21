import { type Context } from 'grammy';
import type { InputMediaPhoto } from 'grammy/types';
import type { ParseMode } from '@grammyjs/types/message';
import type { InlineKeyboardButton, KeyboardButton } from '@grammyjs/types/markup';
import { getPathToAssets } from './path';

export const reply = (
  ctx: Context,
  text: string,
  options?: {
    messageId?: number;
    parseMode?: ParseMode;
    keyboard?: KeyboardButton[][];
    removeKeyboard?: boolean;
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
    ...(options?.removeKeyboard && {
      reply_markup: {
        remove_keyboard: options.removeKeyboard,
      },
    }),
  });
};

export const replyWithPhoto = (
  ctx: Context,
  url: string,
  caption?: string,
  keyboard?: InlineKeyboardButton[][],
) =>
  ctx.replyWithPhoto(url, {
    ...(caption && { caption }),
    ...(keyboard && {
      reply_markup: {
        inline_keyboard: keyboard,
      },
    }),
  });

export const replyWithPhotoGroup = (ctx: Context, images: string[], caption?: string) => {
  const list = images.map((image, index) => {
    const item: InputMediaPhoto = {
      type: 'photo',
      media: getPathToAssets(image),
    };
    return caption && index === 0 ? { ...item, caption } : item;
  });
  return ctx.replyWithMediaGroup(list);
};
