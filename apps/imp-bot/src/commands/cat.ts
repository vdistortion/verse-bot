import { catchErrors, type UniversalContext } from '@verse-bot/shared';
import { getCat } from '../data-sources/index.js';
import { phrases } from '../locales/ru.js';

export const catCommand = catchErrors(async (ctx: UniversalContext) => {
  const catImageUrl = await getCat();
  if (catImageUrl) {
    if (ctx.replyWithPhoto) {
      await ctx.replyWithPhoto(catImageUrl, phrases.cat.caption(ctx.platform));
      return;
    } else {
      await ctx.replySafe(`${phrases.cat.caption(ctx.platform)}\n${catImageUrl}`);
      return;
    }
  }
  await ctx.replySafe(phrases.cat.notFound(ctx.platform));
}, phrases);
