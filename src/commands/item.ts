import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { reply } from '../utils/reply';
import { getList } from '../api';

const debug = createDebug('bot:item_command');

export const item = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "item" command');
  const text = await getList();
  await reply(ctx, text, { parseMode: 'Markdown' });
};
