import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { sendContentItem } from './content';

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
    const itemNumber = randomIndex + 1;

    await sendContentItem(ctx, randomItem, itemNumber);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении случайного контента:', err);
    await ctx.reply(
      `❌ Ошибка при получении случайного контента: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
