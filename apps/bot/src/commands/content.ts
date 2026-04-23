import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '../utils/markdown';

function getImageUrl(filename: string): string {
  const encodedFilename = encodeURIComponent(filename);

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/content-images/${encodedFilename}`;
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

    // Если есть картинка и есть метод replyWithPhoto - отправляем фото
    if (imageUrl && ctx.replyWithPhoto) {
      const caption = requestedItem.text_content
        ? isTg
          ? escapeMarkdownV2(requestedItem.text_content)
          : requestedItem.text_content
        : '';
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

    await ctx.reply(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении контента по номеру:', err);
    const errText =
      ctx.platform === 'telegram'
        ? `❌ Произошла ошибка при получении контента по номеру: ${escapeMarkdownV2(msg)}`
        : `❌ Произошла ошибка при получении контента по номеру: ${msg}`;
    await ctx.reply(errText);
  }
}
