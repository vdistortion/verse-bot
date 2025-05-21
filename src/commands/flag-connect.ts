import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { replyWithPhoto } from '../utils/reply';
import { getCountries } from '../api';
import { chunk } from '../utils/chunkArray';

const debug = createDebug('bot:flag_connect_command');

export const flagConnect = (path: string) => async (ctx: CommandContext<Context>) => {
  const { list, correctAnswerIndex } = await getCountries(path);
  const [indexCountry, country] = list[correctAnswerIndex];
  const flag = path + '/images/flags/' + country.flag[0];
  const buttons = list.map(([index, { name }]) => ({
    text: name.ru,
    callback_data: `flag_answer|${index}|${indexCountry}`,
  }));
  debug('Triggered "flag_connect" command');
  await replyWithPhoto(ctx, flag, 'Какая это страна?', chunk(buttons, 2));
};
