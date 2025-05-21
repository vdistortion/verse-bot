import type { Context, Filter } from 'grammy';
import createDebug from 'debug';
import { getQuote, getAdvice, getCat, getCountries } from '../api';
import { commands } from '../core';
import { reply, replyWithPhoto } from '../utils/reply';
import { chunk } from '../utils/chunkArray';

const debug = createDebug('bot:greeting_text');

export const greeting = (path: string) => async (ctx: Filter<Context, 'message:text'>) => {
  debug('Triggered "greeting" text command');

  let message = '';

  if (ctx.message.text === commands.cat.text) {
    const url = await getCat();
    return replyWithPhoto(ctx, url);
  }

  if (ctx.message.text === commands.flags.text) {
    const { list, correctAnswerIndex } = await getCountries(path);
    const [indexCountry, country] = list[correctAnswerIndex];
    const flag = path + '/images/flags/' + country.flag[0];
    const buttons = list.map(([index, { name }]) => ({
      text: name.ru,
      callback_data: `flag_answer|${index}|${indexCountry}`,
    }));
    return replyWithPhoto(ctx, flag, 'Какая это страна?', chunk(buttons, 2));
  }

  if (ctx.message.text === commands.advice.text) {
    message = await getAdvice();
  } else if (ctx.message.text === commands.quote.text) {
    message = await getQuote();
  } else {
    message = `${ctx.from.first_name}, не понимаю тебя! 😈`;
  }

  await reply(ctx, message, { messageId: ctx.message.message_id, parseMode: 'Markdown' });
};
