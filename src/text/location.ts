import type { Filter } from 'grammy';
import createDebug from 'debug';
import type { Context } from '../core';
import { getWeather } from '../api';
import { getPhrase } from '../utils';

const debug = createDebug('bot:location_text');

export const location = (apiKey: string) => async (ctx: Filter<Context, 'message:location'>) => {
  debug('Triggered "location" text command');

  const { latitude, longitude } = ctx.message.location;
  const answer = await getWeather(apiKey, latitude, longitude);

  await ctx.reply(getPhrase('locationAnswer')(answer), {
    reply_parameters: { message_id: ctx.message.message_id },
    parse_mode: 'Markdown',
  });
};
