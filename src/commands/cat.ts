import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { replyWithPhoto } from '../utils/reply';
import { getCat } from '../api';

const debug = createDebug('bot:cat_command');

export const cat = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "cat" command');
  const url = await getCat();
  await replyWithPhoto(ctx, url);
};
