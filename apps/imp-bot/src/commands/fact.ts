import { catchErrors, type UniversalReplyOptions } from '@verse-bot/core';
import { getFact } from '../data-sources/index.js';
import { getButtons, getInlineButton, phrases } from '../locales/ru.js';
import { formatFor } from '../format.js';

export const factCommand = catchErrors(async (ctx) => {
  const fact = await getFact();
  const extra: UniversalReplyOptions = {};

  if (ctx.chatType === 'private') {
    const fullButtons = getButtons(true);
    const universalKeyboard = [];
    for (let i = 0; i < fullButtons.length; i += 2) {
      universalKeyboard.push(
        fullButtons
          .slice(i, i + 2)
          .map((button) => ({ label: button.label, command: button.command })),
      );
    }
    extra.replyKeyboard = universalKeyboard;
  } else {
    extra.inlineKeyboard = getInlineButton('fact', '🧠 Ещё факт');
  }

  const tags = fact.tags.map((tag) => tag.name).join(', ');
  const sources = fact.sources.map((source) => `${source.title || source.url}: ${source.url}`);
  const details = [
    tags ? `Теги: ${tags}` : '',
    sources.length ? `Источники: ${sources.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const message = details
    ? formatFor(ctx.platform)`${fact.title}\n\n${fact.body}\n\n${details}`
    : formatFor(ctx.platform)`${fact.title}\n\n${fact.body}`;

  await ctx.replySafe(message, extra);
}, phrases);
