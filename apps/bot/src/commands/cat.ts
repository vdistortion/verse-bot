import { type UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';
import { getCat } from '../data-sources';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
    const catImageUrl = await getCat();

    if (catImageUrl) {
      if (ctx.replyWithPhoto) {
        await ctx.replyWithPhoto(catImageUrl, phrases.cat.caption);
        return;
      } else {
        await ctx.replySafe(ctx.format`${phrases.cat.caption}\n${catImageUrl}`);
        return;
      }
    }
    await ctx.replySafe(phrases.cat.notFound);
  } catch (err) {
    console.error('Cat error:', err);
    await ctx.replySafe(phrases.cat.notFound);
  }
}
