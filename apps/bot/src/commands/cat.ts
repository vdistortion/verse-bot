import type { UniversalContext } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { getCat } from '../data-sources';

export async function catCommand(ctx: UniversalContext): Promise<void> {
  try {
    const catImageUrl = await getCat();

    if (catImageUrl) {
      if (ctx.replyWithPhoto) {
        const caption = ctx.platform === 'telegram' ? escapeMarkdownV2('Мяу! 🐾') : 'Мяу! 🐾';
        await ctx.replyWithPhoto(catImageUrl, caption);
        return;
      } else {
        await ctx.reply(
          ctx.platform === 'telegram'
            ? escapeMarkdownV2(`Мяу! 🐾\n\n[Смотреть](${catImageUrl})`)
            : `Мяу! 🐾\n\n[Смотреть](${catImageUrl})`,
        );
        return;
      }
    }

    await ctx.reply(
      ctx.platform === 'telegram'
        ? escapeMarkdownV2('Не удалось получить котика.')
        : 'Не удалось получить котика.',
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    console.error('Ошибка при получении котика:', err);
    await ctx.reply(
      `❌ Ошибка при получении котика: ${ctx.platform === 'telegram' ? escapeMarkdownV2(msg) : msg}`,
    );
  }
}
