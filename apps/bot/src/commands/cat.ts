import type { UniversalContext } from '@scope/shared';
import { getCat } from '../data-sources';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
    const catImageUrl = await getCat();

    if (catImageUrl) {
      if (ctx.replyWithPhoto) {
        const caption = 'Мяу\\! 🐾';
        await ctx.replyWithPhoto(catImageUrl, caption);
        return;
      } else {
        await ctx.reply(`Мяу\\! 🐾\n\n[Смотреть](${catImageUrl})`);
        return;
      }
    }

    await ctx.reply('Не удалось получить котика.');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении котика:', err);
    await ctx.reply(`❌ Ошибка при получении котика: ${escapeMarkdownV2(msg)}`);
  }
}
