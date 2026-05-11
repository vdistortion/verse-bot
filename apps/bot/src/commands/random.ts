import { type UniversalContext } from '@scope/shared';
import { sendContentItem } from './content';
import { phrases } from '../locales/ru';

export async function randomCommand(ctx: UniversalContext): Promise<void> {
  if (!ctx.db) {
    await ctx.replySafe(phrases.random.dbUnavailable(ctx.platform));
    return;
  }

  try {
    const { rows: allContent } = await ctx.db.query('SELECT * FROM bot_content ORDER BY id ASC');

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
