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

export async function randomCommand(ctx: UniversalContext): Promise<void> {
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

    const randomIndex = Math.floor(Math.random() * allContent.length);
    const randomItem = allContent[randomIndex];
    const imageUrl = randomItem.image_url ? getImageUrl(randomItem.image_url) : null;

    const counter = `${randomIndex + 1}/${allContent.length}`;

    if (imageUrl && ctx.replyWithPhoto) {
      let caption = '';
      if (randomItem.text_content) {
        caption =
          ctx.platform === 'telegram'
            ? escapeMarkdownV2(randomItem.text_content)
            : randomItem.text_content;
      }
      caption += `\n\n${counter}`;
      await ctx.replyWithPhoto(imageUrl, caption);
      return;
    }

    // Иначе - просто текст (или ссылка на картинку для старых ботов)
    let message = '';
    if (randomItem.text_content) {
      message +=
        ctx.platform === 'telegram'
          ? escapeMarkdownV2(randomItem.text_content)
          : randomItem.text_content;
    }

    if (imageUrl) {
      message += `\n\n[📷 Смотреть изображение](${imageUrl})`;
    }
    message += `\n\n${counter}`;

    await ctx.reply(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении случайного контента:', err);
    await ctx.reply(
      `❌ Ошибка при получении случайного контента: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
