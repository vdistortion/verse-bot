import type { Context, Filter } from 'grammy';
import createDebug from 'debug';
import { getWeather } from '../api';
import { reply } from '../utils/reply';

const debug = createDebug('bot:location_text');

const location = (apiKey: string) => async (ctx: Filter<Context, 'message:location'>) => {
  debug('Triggered "location" text command');

  const { latitude, longitude } = ctx.message.location;

  if ('live_period' in ctx.message.location) {
    await reply(ctx, 'Автообновляемая геолокация не поддерживается, отправьте статичную 🌐');
    return;
  }

  const message = await getWeather(apiKey, latitude, longitude);

  await reply(ctx, message, { messageId: ctx.message.message_id, parseMode: 'HTML' });
};

export { location };
