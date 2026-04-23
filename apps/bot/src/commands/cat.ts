import type { UniversalContext } from '@scope/shared';
import { getCat } from '../data-sources';
import { escapeMarkdownV2 } from '../utils/markdown';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
    const catImageUrl = await getCat();

    if (catImageUrl) {
      if (ctx.replyWithPhoto) {
        await ctx.replyWithPhoto(catImageUrl, escapeMarkdownV2('Мяу! 🐾'));
        return;
      } else {
        await ctx.reply(
          escapeMarkdownV2('Мяу! 🐾') + `\n\n[📷 Смотреть изображение](${catImageUrl})`,
        );
        return;
      }
    }

    await ctx.reply('Не удалось получить картинку котика. Попробуйте ещё раз!');
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении котика:', err);
    await ctx.reply(`❌ Произошла ошибка при получении котика: ${escapeMarkdownV2(msg)}`);
  }
}
