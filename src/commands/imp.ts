import type { CommandContext } from 'grammy';
import createDebug from 'debug';
import { bot, type Context, isDev } from '../core';
import { getPathToAssets, getPhrase } from '../utils';
import type { CommandsType } from '../types';

const debug = createDebug('bot:imp_command');

export const imp = (commands: CommandsType) => async (ctx: CommandContext<Context>) => {
  debug('Triggered "imp" command');
  await setSpecification(commands);
  await ctx.replyWithMediaGroup([
    {
      type: 'photo',
      media: getPathToAssets('avatar.jpg'),
      caption: '@ImpTelegramBot',
    },
    {
      type: 'photo',
      media: getPathToAssets('hellboy.jpg'),
    },
  ]);
};

async function setSpecification(commands: CommandsType) {
  await bot.api.setMyName(isDev ? '😈 LocalImpBot' : '😈 ImpBot 😈');
  await bot.api.setMyShortDescription(getPhrase('about'));
  await bot.api.setMyDescription(getPhrase('description')(commands));

  await bot.api.setMyCommands([
    { command: commands.start.command, description: commands.start.description },
    { command: commands.flags.command, description: commands.flags.description },
    { command: commands.quote.command, description: commands.quote.description },
    { command: commands.cat.command, description: commands.cat.description },
    { command: commands.help.command, description: commands.help.description },
    { command: commands.stop.command, description: commands.stop.description },
  ]);
}
