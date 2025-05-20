import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { reply } from '../utils/reply';

const debug = createDebug('bot:stop_command');

export const stop = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "stop" command');
  await reply(ctx, 'Stopped', { removeKeyboard: true });
};
