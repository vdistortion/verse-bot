import { getCommandStats, bold, requireAdmin, catchErrors } from '@verse-bot/shared';
import { phrases } from '../locales/ru';

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

    let message = ctx.format`${bold('📊 Статистика команд')}\n\n`;
    for (const [cmd, counts] of Object.entries(grouped)) {
      const parts: string[] = [];
      if (counts.tg > 0) parts.push(`TG: ${counts.tg}`);
      if (counts.vk > 0) parts.push(`VK: ${counts.vk}`);
      message += ctx.format`${bold(cmd)} — ${parts.join(', ')}\n`;
    }

    await ctx.replySafe(message);
  }, phrases),
  phrases,
);
