import { catchErrors } from '@verse-bot/shared';
import { sendContentItem } from './content';
import { phrases } from '../locales/ru';

export const randomCommand = catchErrors(async (ctx) => {
  if (!ctx.db) {
    await ctx.replySafe(phrases.random.dbUnavailable(ctx.platform));
    return;
  }

  const { rows: allContent } = await ctx.db.query('SELECT * FROM bot_content ORDER BY id ASC');

  if (!allContent || allContent.length === 0) {
    await ctx.replySafe(phrases.random.emptyDb(ctx.platform));
    return;
  }

  const randomIndex = Math.floor(Math.random() * allContent.length);
  const randomItem = allContent[randomIndex];
  const itemNumber = randomIndex + 1;

  await sendContentItem(ctx, randomItem, itemNumber);
}, phrases)
