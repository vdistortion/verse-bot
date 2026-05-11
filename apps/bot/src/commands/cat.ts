import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';
import { getCat } from '../data-sources';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
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
  } catch (err) {
    console.error('Cat error:', err);
    await ctx.replySafe(phrases.cat.notFound(ctx.platform));
  }
}
