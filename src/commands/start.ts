import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { getKeyboard } from '../keyboard';
import { reply } from '../utils/reply';

const debug = createDebug('bot:start_command');

const start = (aliases: Record<string, string>) => async (ctx: CommandContext<Context>) => {
  debug('Triggered "start" command');

  let message = 'Держи клавиатуру! 😈';

  if (ctx.chat.type === 'supergroup') {
    message = `Привет, чат <b>${ctx.chat.title}</b>! 😈`;
  } else if (ctx.chat.type === 'private') {
    const alias = aliases[ctx.chat.username as string] || ctx.chat.first_name;
    message = `Будь как дома, путник <b>${alias}</b>! 😈`;
  }

  await reply(ctx, message, { parseMode: 'HTML', keyboard: getKeyboard() });
};

export { start };
