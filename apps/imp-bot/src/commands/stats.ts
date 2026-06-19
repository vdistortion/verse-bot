import { requireAdmin, catchErrors, type RichMessage } from '@verse-bot/core';
import { getCommandStats } from '@verse-bot/db';
import { bold } from 'tg-rich-messages';
import { phrases } from '../locales/ru.js';
import { concatRich } from '../rich-utils.js';

export const statsCommand = requireAdmin(
  catchErrors(async (ctx) => {
    const stats = await getCommandStats();
    if (stats.length === 0) {
      await ctx.replySafe('Статистика пуста');
      return;
    }

    // Группируем по команде независимо от платформы
    const grouped: Record<string, { tg: number; vk: number }> = {};
    for (const s of stats) {
      if (!grouped[s.command]) grouped[s.command] = { tg: 0, vk: 0 };
      if (s.platform === 'telegram') grouped[s.command].tg += s.count;
      else if (s.platform === 'vk') grouped[s.command].vk += s.count;
    }

    const messageParts: RichMessage[] = [];
    messageParts.push(ctx.format`${bold('📊 Статистика команд')}\n\n`);
    for (const [cmd, counts] of Object.entries(grouped)) {
      const parts: string[] = [];
      if (counts.tg > 0) parts.push(`TG: ${counts.tg}`);
      if (counts.vk > 0) parts.push(`VK: ${counts.vk}`);
      messageParts.push(ctx.format`${bold(cmd)} — ${parts.join(', ')}\n`);
    }

    await ctx.replySafe(concatRich(ctx.format, messageParts));
  }, phrases),
);
