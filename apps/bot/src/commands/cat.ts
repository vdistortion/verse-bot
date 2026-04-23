import type { UniversalContext } from '@scope/shared';
import { getCat } from '../data-sources';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
    const catImageUrl = await getCat();

    if (catImageUrl) {
      if (ctx.replyWithPhoto) {
        const caption = ctx.platform === 'telegram' ? escapeMarkdownV2('Мяу! 🐾') : 'Мяу! 🐾';
        await ctx.replyWithPhoto(catImageUrl, caption);
        return;
      } else {
        const label = ctx.platform === 'telegram' ? escapeMarkdownV2('Мяу! 🐾') : 'Мяу! 🐾';
        await ctx.reply(`${label}\n\n[📷 Смотреть изображение](${catImageUrl})`);
        return;
      }
    }

    await ctx.reply('Не удалось получить картинку котика. Попробуйте ещё раз!');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении котика:', err);
    const errText =
      ctx.platform === 'telegram'
        ? `❌ Произошла ошибка при получении котика: ${escapeMarkdownV2(msg)}`
        : `❌ Произошла ошибка при получении котика: ${msg}`;
    await ctx.reply(errText);
  }
}
