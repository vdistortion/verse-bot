import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
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
  const isTg = ctx.platform === 'telegram';
  const hint = phrases.content.commandHint(itemNumber);

  if (imageUrl && ctx.replyWithPhoto) {
    let caption = '';
    if (item.text_content) {
      caption += isTg ? escapeMarkdownV2(item.text_content) : item.text_content;
    }
    caption += isTg ? `\n\n\`${hint}\`` : `\n\n${hint}`;
    await ctx.replyWithPhoto(imageUrl, caption);
    return;
  }

  let message = '';
  if (item.text_content) {
    message += isTg ? escapeMarkdownV2(item.text_content) : item.text_content;
  }
  if (imageUrl) {
    message += isTg ? `\n\n[📷 Смотреть изображение](${imageUrl})` : `\n\n${imageUrl}`;
  }
  message += isTg ? `\n\n\`${hint}\`` : `\n\n${hint}`;
  await ctx.reply(message, ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {});
}

export async function contentCommand(ctx: UniversalContext, itemNumber: number): Promise<void> {
  if (!ctx.db) {
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.content.dbUnavailable : phrases.content.dbUnavailable,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
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
        ctx.platform === 'telegram' ? phrases.content.emptyDb : phrases.content.emptyDb,
        ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
      );
      return;
    }

    const itemIndex = itemNumber - 1;

    if (itemIndex < 0 || itemIndex >= allContent.length) {
      await ctx.reply(
        ctx.platform === 'telegram'
          ? phrases.content.notFound(itemNumber, allContent.length)
          : phrases.content.notFound(itemNumber, allContent.length),
        ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
      );
      return;
    }

    const requestedItem = allContent[itemIndex];
    await sendContentItem(ctx, requestedItem, itemNumber);
  } catch (err) {
    console.error('Content error:', err);
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.content.error : phrases.content.error,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
