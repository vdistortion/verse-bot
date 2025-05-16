import type { Context, Filter } from 'grammy';
import createDebug from 'debug';
import { getQuote, getAdvice, getCat } from '../api/fetch';
import { buttons } from '../keyboard';
import { reply, replyWithPhoto } from '../utils/reply';

const debug = createDebug('bot:greeting_text');

const greeting = () => async (ctx: Filter<Context, 'message'>) => {
  debug('Triggered "greeting" text command');

  let message = '';

  if (ctx.message.text === buttons.cat.text) {
    const url = await getCat();
    return replyWithPhoto(ctx, url);
  }

  if (ctx.message.text === buttons.advice.text) {
    message = await getAdvice();
  } else if (ctx.message.text === buttons.quote.text) {
    message = await getQuote();
  } else {
    message = `${ctx.from.first_name}, не понимаю тебя! 😈`;
  }

  await reply(ctx, message, { messageId: ctx.message.message_id, parseMode: 'HTML' });
};

export { greeting };
