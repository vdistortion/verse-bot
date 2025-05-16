import type { Context } from 'grammy';
import createDebug from 'debug';
import { reply, replyWithPhoto } from '../utils/reply';
import countries from '../countries.json';

const debug = createDebug('bot:flag_connect_command');

const flagConnect = (path: string) => async (ctx: Context) => {
  const message = 'Выберите тест:';
  debug(`Triggered "flag_connect" command with message \n${message}`);
  await reply(ctx, message);
  await replyWithPhoto(ctx, path + countries[0].flag[0]);
};

export { flagConnect };
