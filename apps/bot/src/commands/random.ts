import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';
import { sendContentItem } from './content';

export async function randomCommand(ctx: UniversalContext): Promise<void> {
  if (!ctx.db) {
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.random.dbUnavailable : phrases.random.dbUnavailable,
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
        ctx.platform === 'telegram' ? phrases.random.emptyDb : phrases.random.emptyDb,
        ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
      );
      return;
    }

    const randomIndex = Math.floor(Math.random() * allContent.length);
    const randomItem = allContent[randomIndex];
    const itemNumber = randomIndex + 1;

    await sendContentItem(ctx, randomItem, itemNumber);
  } catch (err) {
    console.error('Random error:', err);
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.random.error : phrases.random.error,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
