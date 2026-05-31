import { catchErrors, type UniversalContext } from '@verse-bot/shared';
import { phrases } from '../locales/ru.js';
import { CONTENT_IMAGES_BASE_URL } from '../env.js';

interface BotContentItem {
  id: number;
  image_url?: string;
  text_content?: string;
}

function getImageUrl(filename: string): string | null {
  if (!CONTENT_IMAGES_BASE_URL) return null;
  return `${CONTENT_IMAGES_BASE_URL}/${encodeURIComponent(filename)}`;
}

export async function sendContentItem(
  ctx: UniversalContext,
  item: BotContentItem,
  itemNumber: number,
): Promise<void> {
  const imageUrl = item.image_url ? getImageUrl(item.image_url) : null;
  const hint = phrases.content.commandHint(ctx.platform, itemNumber);

  if (imageUrl && ctx.replyWithPhoto) {
    let caption = '';
    if (item.text_content) {
      caption += ctx.format`${item.text_content}`;
    }
    caption += ctx.platform === 'telegram' ? `\n\n\`${hint}\`` : `\n\n${hint}`;
    await ctx.replyWithPhoto(imageUrl, caption);
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
  message += ctx.platform === 'telegram' ? `\n\n\`${hint}\`` : `\n\n${hint}`;
  await ctx.replySafe(message);
}

export const contentCommand = catchErrors(async (ctx: UniversalContext, itemNumber: number) => {
  if (!ctx.db) {
    await ctx.replySafe(phrases.content.dbUnavailable(ctx.platform));
    return;
  }

  const { rows: allContent } = await ctx.db.query('SELECT * FROM bot_content ORDER BY id ASC');

  if (!allContent || allContent.length === 0) {
    await ctx.replySafe(phrases.content.emptyDb(ctx.platform));
    return;
  }

  const itemIndex = itemNumber - 1;

  if (itemIndex < 0 || itemIndex >= allContent.length) {
    await ctx.replySafe(phrases.content.notFound(ctx.platform, itemNumber, allContent.length));
    return;
  }

  const requestedItem = allContent[itemIndex];
  await sendContentItem(ctx, requestedItem, itemNumber);
}, phrases);
