import {
  catchErrors,
  code,
  format,
  type UniversalContext,
  type UniversalReplyOptions,
} from '@verse-bot/shared';
import { phrases } from '../locales/ru.js';
import { PUBLIC_URL } from '../env.js';

interface BotContentItem {
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
  const hintLine = ctx.format`\n\n${code(phrases.contentHint(ctx.platform, itemNumber))}`;

  if (imageUrl && ctx.replyWithPhoto) {
    let caption = '';
    if (item.text_content) {
      caption += ctx.format`${item.text_content}`;
    }
    caption += ctx.isAdmin && ctx.chatType === 'private' ? hintLine : '';
    await ctx.replyWithPhoto(imageUrl, caption, extra);
    return;
  }

  let message = '';
  if (item.text_content) {
    message += ctx.format`${item.text_content}`;
  }
  if (imageUrl) {
    message +=
      ctx.platform === 'telegram'
        ? `\n\n[📷 Смотреть изображение](${imageUrl})`
        : `\n\n${imageUrl}`;
  }
  message += hintLine;
  await ctx.replySafe(message, extra);
}

export const contentCommand = catchErrors(async (ctx: UniversalContext, itemNumber: number) => {
  if (!ctx.db) {
    await ctx.replySafe(format(ctx.platform)`❌ База данных недоступна.`);
    return;
  }

  const { rows: allContent } = await ctx.db.query('SELECT * FROM bot_content ORDER BY id ASC');

  if (!allContent || allContent.length === 0) {
    await ctx.replySafe(format(ctx.platform)`В базе данных нет контента.`);
    return;
  }

  const itemIndex = itemNumber - 1;

  if (itemIndex < 0 || itemIndex >= allContent.length) {
    await ctx.replySafe(
      format(
        ctx.platform,
      )`Контент с номером ${String(itemNumber)} не найден. Всего элементов: ${String(allContent.length)}.`,
    );
    return;
  }

  const requestedItem = allContent[itemIndex];
  await sendContentItem(ctx, requestedItem, itemNumber);
}, phrases);
