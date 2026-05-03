import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { phrases } from '../locales/ru';
import { getCat } from '../data-sources';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
    const catImageUrl = await getCat();

    if (catImageUrl) {
      if (ctx.replyWithPhoto) {
        await ctx.replyWithPhoto(
          catImageUrl,
          ctx.platform === 'telegram' ? escapeMarkdownV2(phrases.cat.caption) : phrases.cat.caption,
        );
        return;
      } else {
        await ctx.reply(
          ctx.platform === 'telegram'
            ? escapeMarkdownV2(`${phrases.cat.caption}\n${catImageUrl}`)
            : `${phrases.cat.caption}\n${catImageUrl}`,
          ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
        );
        return;
      }
    }
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.cat.notFound : phrases.cat.notFound,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  } catch (err) {
    console.error('Cat error:', err);
    await ctx.reply(
      ctx.platform === 'telegram' ? phrases.cat.notFound : phrases.cat.notFound,
      ctx.platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {},
    );
  }
}
