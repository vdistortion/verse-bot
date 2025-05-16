import type { Context, Filter } from 'grammy';
import createDebug from 'debug';
import { getWeather } from '../api/fetch';
import { reply } from '../utils/reply';

const debug = createDebug('bot:location_text');

const location = (apiKey: string) => async (ctx: Filter<Context, 'message:location'>) => {
  debug('Triggered "location" text command');

  const { latitude, longitude } = ctx.message.location;

  if ('live_period' in ctx.message.location) {
    await reply(ctx, 'Автообновляемая геолокация не поддерживается, отправьте статичную 🌐');
    return;
  }

  const answer = await getWeather(apiKey, latitude, longitude);
  const wind = answer.wind.speed > 0 ? `<i>Ветер</i> ${answer.wind.speed} м/с` : 'Штиль';
  const message = `
<b>${answer.name}</b>
<i>Температура</i> ${answer.main.temp} ℃
<i>По ощущению</i> ${answer.main.feels_like} ℃
<i>Влажность</i> ${answer.main.humidity}%
<i>Давление</i> ${answer.main.pressure} мм рт. ст.
${wind}
  `;
  await reply(ctx, message, { messageId: ctx.message.message_id, parseMode: 'HTML' });
};

export { location };
