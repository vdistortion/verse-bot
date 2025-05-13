import { Context, Input } from 'telegraf';
import createDebug from 'debug';
import countries from '../countries.json';

const debug = createDebug('bot:flagConnect_command');

const flagConnect = (path: string) => async (ctx: Context) => {
  const message = 'Выберите тест:';
  debug(`Triggered "flagConnect" command with message \n${message}`);
  await ctx.replyWithMarkdownV2(message, { parse_mode: 'Markdown' });
  await ctx.replyWithPhoto(Input.fromURL(path + countries[0].flag[0]));
};

export { flagConnect };
