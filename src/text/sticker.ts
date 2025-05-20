import type { Context, Filter } from 'grammy';
import createDebug from 'debug';
import { reply } from '../utils/reply';

const debug = createDebug('bot:sticker_text');

export const sticker = () => async (ctx: Filter<Context, 'message:sticker'>) => {
  debug('Triggered "sticker" text command');
  await reply(ctx, '👀');
};
