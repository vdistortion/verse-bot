import type { CommandContext, Context } from 'grammy';
import createDebug from 'debug';
import { replyWithPhotoGroup } from '../utils/reply';
import { getImage } from '../api';

const debug = createDebug('bot:image_command');

export const image = () => async (ctx: CommandContext<Context>) => {
  debug('Triggered "image" command');
  const { image, caption } = await getImage();
  await replyWithPhotoGroup(ctx, [`images/${image}`], caption);
};
