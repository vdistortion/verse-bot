import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';
import { VERCEL_PROJECT_PRODUCTION_URL } from '../env';

interface BotContentItem {
  id: number;
  image_url?: string;
  text_content?: string;
}

function getImageUrl(filename: string): string {
  const encodedFilename = encodeURIComponent(filename);

  if (VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${VERCEL_PROJECT_PRODUCTION_URL}/content-images/${encodedFilename}`;
  }

  return `/content-images/${encodedFilename}`;
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

export async function contentCommand(ctx: UniversalContext, itemNumber: number): Promise<void> {
  if (!ctx.db) {
    await ctx.replySafe(phrases.content.dbUnavailable);
    return;
  }

  try {
    const { data: allContent, error: fetchError } = await ctx.db
      .from('bot_content')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    if (!allContent || allContent.length === 0) {
      await ctx.replySafe(phrases.content.emptyDb);
      return;
    }

    const itemIndex = itemNumber - 1;

    if (itemIndex < 0 || itemIndex >= allContent.length) {
      await ctx.replySafe(phrases.content.notFound(ctx.platform, itemNumber, allContent.length));
      return;
    }

    const requestedItem = allContent[itemIndex];
    await sendContentItem(ctx, requestedItem, itemNumber);
  } catch (err) {
    console.error('Content error:', err);
    await ctx.replySafe(phrases.content.error);
  }
}
