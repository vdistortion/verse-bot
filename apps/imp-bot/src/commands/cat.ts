import { catchErrors, type UniversalContext } from '@verse-bot/shared';
import { getCat } from '../data-sources';
import { phrases } from '../locales/ru';

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
