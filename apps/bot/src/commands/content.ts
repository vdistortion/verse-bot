import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { VERCEL_PROJECT_PRODUCTION_URL } from '../env';

function getImageUrl(filename: string): string {
  const encodedFilename = encodeURIComponent(filename);

  if (VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${VERCEL_PROJECT_PRODUCTION_URL}/content-images/${encodedFilename}`;
  }

  return `/content-images/${encodedFilename}`;
}

export async function contentCommand(ctx: UniversalContext, itemNumber: number): Promise<void> {
  if (!ctx.db) {
    await ctx.reply('❌ База данных недоступна.');
    return;
  }

  if (isNaN(itemNumber) || itemNumber < 1) {
    await ctx.reply('Пожалуйста, укажите корректный номер контента (начиная с 1).');
    return;
  }

  try {
    const { data: allContent, error: fetchError } = await ctx.db
      .from('bot_content')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    if (!allContent || allContent.length === 0) {
      await ctx.reply('В базе данных нет контента.');
      return;
    }

    const itemIndex = itemNumber - 1;

    if (itemIndex < 0 || itemIndex >= allContent.length) {
      await ctx.reply(
        `Контент с номером ${itemNumber} не найден. Всего элементов: ${allContent.length}. Введите число от 1 до ${allContent.length}.`,
      );
      return;
    }

    const requestedItem = allContent[itemIndex];
    const imageUrl = requestedItem.image_url ? getImageUrl(requestedItem.image_url) : null;
    const isTg = ctx.platform === 'telegram';
    const counter = `${itemNumber}/${allContent.length}`;

    // Если есть картинка и есть метод replyWithPhoto - отправляем фото
    if (imageUrl && ctx.replyWithPhoto) {
      let caption = '';
      if (requestedItem.text_content) {
        caption += isTg ? escapeMarkdownV2(requestedItem.text_content) : requestedItem.text_content;
      }
      caption += `\n\n${counter}`;
      await ctx.replyWithPhoto(imageUrl, caption);
      return;
    }

    // Иначе - просто текст
    let message = '';
    if (requestedItem.text_content) {
      message += isTg ? escapeMarkdownV2(requestedItem.text_content) : requestedItem.text_content;
    }

    if (imageUrl) {
      message += `\n\n[📷 Смотреть изображение](${imageUrl})`;
    }
    message += `\n\n${counter}`;

    await ctx.reply(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении контента по номеру:', err);
    await ctx.reply(
      `❌ Произошла ошибка при получении контента по номеру: ${escapeMarkdownV2(msg)}`,
    );
  }
}
