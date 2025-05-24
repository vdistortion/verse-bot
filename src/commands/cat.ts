import type { CommandContext } from 'grammy';
import createDebug from 'debug';
import type { Context } from '../core';
import { getCat } from '../api';
import { getPhrase } from '../utils';

const debug = createDebug('bot:cat_command');

export const cat = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "cat" command');
  try {
    const url = await getCat();
    await ctx.replyWithPhoto(url);
  } catch {
    await ctx.reply(getPhrase('catNotFound'));
  }
};
