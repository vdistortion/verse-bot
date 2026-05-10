import { type UniversalContext } from '@scope/shared';
import { sendContentItem } from './content';
import { phrases } from '../locales/ru';

export async function randomCommand(ctx: UniversalContext): Promise<void> {
  if (!ctx.db) {
    await ctx.replySafe(phrases.random.dbUnavailable(ctx.platform));
    return;
  }

  try {
    const { data: allContent, error: fetchError } = await ctx.db
      .from('bot_content')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    if (!allContent || allContent.length === 0) {
      await ctx.replySafe(phrases.random.emptyDb(ctx.platform));
      return;
    }

    const randomIndex = Math.floor(Math.random() * allContent.length);
    const randomItem = allContent[randomIndex];
    const itemNumber = randomIndex + 1;

    await sendContentItem(ctx, randomItem, itemNumber);
  } catch (err) {
    console.error('Random error:', err);
    await ctx.replySafe(phrases.random.error(ctx.platform));
  }
}
