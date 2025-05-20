import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { reply } from '../utils/reply';
import { getKeyboard } from '../keyboard';

const debug = createDebug('bot:advice_command');

export const advice = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "advice" command');
  await reply(ctx, '😈', { keyboard: getKeyboard(true) });
};
