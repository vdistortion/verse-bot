import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { getKeyboard } from '../keyboard';
import { reply } from '../utils/reply';

const debug = createDebug('bot:start_command');

export const start = (aliases: Record<string, string>) => async (ctx: CommandContext<Context>) => {
  debug('Triggered "start" command');

  const { type, title, first_name, username } = ctx.chat;
  let message = 'Держи клавиатуру! 😈';

  if (['supergroup', 'group'].includes(type)) {
    message = `Привет, чат *${title}*! 😈`;
  } else if (type === 'private') {
    const alias = aliases[String(username)];
    message = alias ? `Будь как дома, *${alias}*! 😈` : `Будь как дома, путник *${first_name}*! 😈`;
  }

  await reply(ctx, message, {
    parseMode: 'Markdown',
    keyboard: getKeyboard(ctx.chat.type === 'private'),
  });
};
