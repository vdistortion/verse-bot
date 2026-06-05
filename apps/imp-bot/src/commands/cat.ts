import { catchErrors, type UniversalContext, type UniversalReplyOptions } from '@verse-bot/core';
import { getCat } from '../data-sources/index.js';
import { getInlineButton, phrases } from '../locales/ru.js';

export const catCommand = catchErrors(async (ctx: UniversalContext) => {
  const catImageUrl = await getCat();
  const extra: UniversalReplyOptions = {};

  if (ctx.chatType !== 'private') {
    extra.inlineKeyboard = getInlineButton('cat', '🐾 Догнать');
  }

  if (catImageUrl) {
    if (ctx.replyWithPhoto) {
      await ctx.replyWithPhoto(catImageUrl, phrases.cat.caption(ctx.platform), extra);
      return;
    } else {
      await ctx.replySafe(`${phrases.cat.caption(ctx.platform)}\n${catImageUrl}`, extra);
      return;
    }
  }

  await ctx.replySafe(phrases.cat.notFound(ctx.platform), extra);
}, phrases);
