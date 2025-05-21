import type { Context, Filter } from 'grammy';
import createDebug from 'debug';

const debug = createDebug('bot:sticker_text');

export const sticker = () => async (ctx: Filter<Context, 'message:sticker'>) => {
  debug('Triggered "sticker" text command');
  await ctx.react('👀');
};
