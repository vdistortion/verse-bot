import {
  catchErrors,
  type RichMessage,
  type UniversalContext,
  type UniversalReplyOptions,
} from '@verse-bot/core';
import { code, link } from 'tg-rich-messages';
import { phrases } from '../locales/ru.js';
import { PUBLIC_URL } from '../env.js';
import { concatRich } from '../rich-utils.js';

export interface BotContentItem {
  id: number;
  image_url?: string;
  text_content?: string;
}

function getImageUrl(filename: string): string | null {
  if (!PUBLIC_URL) return null;
  return `${PUBLIC_URL}/${encodeURIComponent(filename)}`;
}

export async function sendContentItem(
  ctx: UniversalContext,
  item: BotContentItem,
  itemNumber: number,
  extra?: UniversalReplyOptions,
): Promise<void> {
  const imageUrl = item.image_url ? getImageUrl(item.image_url) : null;
  const hintText = phrases.contentHint(ctx.format, itemNumber);
  const hintLine = ctx.format`\n\n${code(hintText)}`;

  if (imageUrl && ctx.replyWithPhoto) {
    const captionParts: RichMessage[] = [];

    if (item.text_content) {
      captionParts.push(ctx.format`${item.text_content}`);
    }

    if (ctx.isAdmin && ctx.chatType === 'private') {
      captionParts.push(hintLine);
    }

    await ctx.replyWithPhoto(imageUrl, concatRich(ctx.format, captionParts), extra);
    return;
  }

  const messageParts: RichMessage[] = [];
  if (item.text_content) {
    messageParts.push(ctx.format`${item.text_content}`);
  }
  if (imageUrl) {
    messageParts.push(ctx.format`${link('📷 Смотреть изображение', imageUrl)}`);
  }
  if (ctx.isAdmin && ctx.chatType === 'private') {
    messageParts.push(hintLine);
  }

  await ctx.replySafe(concatRich(ctx.format, messageParts), extra);
}

export const contentCommand = catchErrors(async (ctx: UniversalContext, itemNumber: number) => {
  if (!ctx.db) {
    await ctx.replySafe(ctx.format`❌ База данных недоступна.`);
    return;
  }

  const { rows: allContent } = await ctx.db.query('SELECT * FROM bot_content ORDER BY id ASC');

  if (!allContent || allContent.length === 0) {
    await ctx.replySafe(ctx.format`В базе данных нет контента.`);
    return;
  }

  const itemIndex = itemNumber - 1;

  if (itemIndex < 0 || itemIndex >= allContent.length) {
    await ctx.replySafe(
      ctx.format`Контент с номером ${String(itemNumber)} не найден. Всего элементов: ${String(allContent.length)}.`,
    );
    return;
  }

  const requestedItem: BotContentItem = allContent[itemIndex];
  await sendContentItem(ctx, requestedItem, itemNumber);
}, phrases);
