import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
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
  const isTg = ctx.platform === 'telegram';
  const contentCommandText = `/content_${itemNumber}`;

  if (imageUrl && ctx.replyWithPhoto) {
    let caption = '';
    if (item.text_content) {
      caption += isTg ? escapeMarkdownV2(item.text_content) : item.text_content;
    }

    caption += isTg
      ? `\n\n\`${escapeMarkdownV2(contentCommandText)}\``
      : `\n\n${contentCommandText}`;
    await ctx.replyWithPhoto(imageUrl, caption);
    return;
  }

  let message = '';
  if (item.text_content) {
    message += isTg ? escapeMarkdownV2(item.text_content) : item.text_content;
  }

  if (imageUrl) {
    message += `\n\n[📷 Смотреть изображение](${imageUrl})`;
  }
  message += isTg
    ? `\n\n\`${escapeMarkdownV2(contentCommandText)}\``
    : `\n\n${contentCommandText}`;

  await ctx.reply(message);
}

export async function contentCommand(ctx: UniversalContext, itemNumber: number): Promise<void> {
  if (!ctx.db) {
    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('❌ База данных недоступна.')
        : '❌ База данных недоступна.',
    );
    return;
  }

  try {
    const { data: allContent, error: fetchError } = await ctx.db
      .from('bot_content')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    if (!allContent || allContent.length === 0) {
      await ctx.reply(
        ctx.platform === 'telegram'
          ? escapeMarkdownV2('В базе данных нет контента.')
          : 'В базе данных нет контента.',
      );
      return;
    }

    const itemIndex = itemNumber - 1;

    if (itemIndex < 0 || itemIndex >= allContent.length) {
      await ctx.reply(
        ctx.platform === 'telegram'
          ? escapeMarkdownV2(
              `Контент с номером ${itemNumber} не найден. Всего элементов: ${allContent.length}. Введите число от 1 до ${allContent.length}.`,
            )
          : `Контент с номером ${itemNumber} не найден. Всего элементов: ${allContent.length}. Введите число от 1 до ${allContent.length}.`,
      );
      return;
    }

    const requestedItem = allContent[itemIndex];
    await sendContentItem(ctx, requestedItem, itemNumber);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении контента по номеру:', err);
    await ctx.reply(
      `❌ Произошла ошибка при получении контента по номеру: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
