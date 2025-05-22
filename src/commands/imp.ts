import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { replyWithPhotoGroup } from '../utils/reply';

const debug = createDebug('bot:imp_command');

export const imp =
  (setSpecification: () => Promise<void>) => async (ctx: CommandContext<Context>) => {
    debug('Triggered "imp" command');
    await setSpecification();
    await replyWithPhotoGroup(ctx, ['avatar.jpg', 'hellboy.jpg'], '@ImpTelegramBot');
  };
