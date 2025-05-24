import type { CommandContext } from 'grammy';
import createDebug from 'debug';
import type { Context } from '../core';
import { getKeyboard } from '../keyboard';
import { getPhrase } from '../utils';

const debug = createDebug('bot:start_command');

export const start = (aliases: Record<string, string>) => async (ctx: CommandContext<Context>) => {
  debug('Triggered "start" command');

  const { type, title, first_name, username } = ctx.chat;
  let message = getPhrase('defaultStartMessage');

  if (['supergroup', 'group'].includes(type)) {
    message = getPhrase('groupStartMessage')(`${title}`);
  } else if (type === 'private') {
    const alias = aliases[String(username)];
    message = alias
      ? getPhrase('aliasStartMessage')(`${alias}`)
      : getPhrase('privateStartMessage')(`${first_name}`);
  }

  await ctx.reply(message, {
    parse_mode: 'Markdown',
    reply_markup: getKeyboard(ctx.chat.type === 'private'),
  });
};
