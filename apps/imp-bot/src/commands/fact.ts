import { catchErrors, type UniversalReplyOptions } from '@verse-bot/core';
import { bold } from 'tg-rich-messages';
import { getFact } from '../data-sources/index.js';
import { phrases } from '../locales/ru.js';
import { formatFor } from '../format.js';

export const factCommand = catchErrors(async (ctx) => {
  const fact = await getFact();
  const extra: UniversalReplyOptions = {};
  const source = fact.sources[0];
  extra.inlineKeyboard = [
    [
      ...(source ? [{ label: 'Источник', url: source.url }] : []),
      { label: 'Ещё фрагмент', command: '/fact' },
    ],
  ];
  const message = formatFor(ctx.platform)`${bold(fact.title)}\n\n${fact.body}`;

  await ctx.replySafe(message, extra);
}, phrases);
