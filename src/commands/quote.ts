import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { reply } from '../utils/reply';
import { getQuote } from '../api';

const debug = createDebug('bot:quote_command');

export const quote = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "quote" command');
  const text = await getQuote();
  await reply(ctx, text, { parseMode: 'Markdown' });
};
