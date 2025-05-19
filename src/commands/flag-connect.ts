import type { Context } from 'grammy';
import createDebug from 'debug';
import { reply, replyWithPhoto } from '../utils/reply';
import { getCountries } from '../api';

const debug = createDebug('bot:flag_connect_command');

const flagConnect = (path: string) => async (ctx: Context) => {
  const [country] = await getCountries(path);
  const message = country.name.ru;
  debug(`Triggered "flag_connect" command with message \n${message}`);
  await reply(ctx, message);
  await replyWithPhoto(ctx, path + '/images/flags/' + country.flag[0]);
};

export { flagConnect };
