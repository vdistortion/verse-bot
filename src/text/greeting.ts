import type { Context } from 'telegraf';
import type { Update } from 'telegraf/typings/core/types/typegram';
import createDebug from 'debug';
import { getQuote, getAdvice, getCat } from '../api/fetch';
import { ButtonTypes } from '../keyboard';
import { reply, replyWithPhoto } from '../utils/reply';

const debug = createDebug('bot:greeting_text');

const greeting = () => async (ctx: Context<Update>) => {
  debug('Triggered "greeting" text command');

  const messageId = ctx.message?.message_id;
  let message = '';

  if (messageId) {
    // @ts-ignore
    if (ctx.message.text === ButtonTypes.CAT) {
      const url = await getCat();
      return replyWithPhoto(ctx, url);
    }

    // @ts-ignore
    if (ctx.message.text === ButtonTypes.ADVICE) {
      message = await getAdvice();
      // @ts-ignore
    } else if (ctx.message.text === ButtonTypes.QUOTE) {
      message = await getQuote();
    } else {
      message = `${ctx.from?.first_name}, не понимаю тебя! 😈`;
    }

    await reply(ctx, message, { messageId, parseMode: 'HTML' });
  }
};

export { greeting };
