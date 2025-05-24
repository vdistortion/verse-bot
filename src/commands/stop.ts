import type { CommandContext } from 'grammy';
import createDebug from 'debug';
import type { Context } from '../core';
import { getPhrase } from '../utils';

const debug = createDebug('bot:stop_command');

export const stop = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "stop" command');
  await ctx.reply(getPhrase('stopCommand'), {
    reply_markup: {
      remove_keyboard: true,
    },
  });
};
