import type { UniversalContext } from '@scope/shared';
import { phrases } from '../locales/ru';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME, VK_GROUP_ID, VK_TOKEN } from '../env';
import { homepage } from '../../../../package.json';

export async function helpCommand(ctx: UniversalContext): Promise<void> {
  const isTg = ctx.platform === 'telegram';
  const repoUrl = homepage;

  const message = phrases.help.getMessage({
    isTg,
    isAdmin: ctx.isAdmin ?? false,
    chatType: ctx.chatType,
    vkGroupLink: VK_TOKEN ? VK_GROUP_ID : undefined,
    tgUsername: TELEGRAM_BOT_TOKEN ? TELEGRAM_BOT_USERNAME : undefined,
    repoUrl,
  });

  await ctx.reply(message, {
    parse_mode: 'MarkdownV2',
    link_preview_options: { is_disabled: true },
  });
}
