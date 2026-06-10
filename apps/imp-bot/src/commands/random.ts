import { catchErrors, type UniversalReplyOptions } from '@verse-bot/core';
import { sendContentItem } from './content.js';
import { getButtons, getInlineButton, phrases } from '../locales/ru.js';

export const randomCommand = catchErrors(async (ctx) => {
  if (!ctx.db) {
    await ctx.replySafe(ctx.format`❌ База данных недоступна.`);
    return;
  }

  const { rows: allContent } = await ctx.db.query('SELECT * FROM bot_content ORDER BY id ASC');

  if (!allContent || allContent.length === 0) {
    await ctx.replySafe(ctx.format`В базе данных нет контента.`);
    return;
  }

  const randomIndex = Math.floor(Math.random() * allContent.length);
  const randomItem = allContent[randomIndex];
  const itemNumber = randomIndex + 1;
  const extra: UniversalReplyOptions = {};

  if (ctx.chatType === 'private') {
    const fullButtons = getButtons(true);
    const universalKeyboard = [];
    for (let i = 0; i < fullButtons.length; i += 2) {
      universalKeyboard.push(
        fullButtons.slice(i, i + 2).map((b) => ({ label: b.label, command: b.command })),
      );
    }
    extra.replyKeyboard = universalKeyboard;
  } else {
    extra.inlineKeyboard = getInlineButton('random', '🚀 В неизвестность');
  }

  await sendContentItem(ctx, randomItem, itemNumber, extra);
}, phrases);
