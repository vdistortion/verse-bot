import { catchErrors, type UniversalReplyOptions } from '@verse-bot/shared';
import { getAdvice } from '../data-sources/index.js';
import { getButtons, getInlineButton, phrases } from '../locales/ru.js';

export const adviceCommand = catchErrors(async (ctx) => {
  const adviceText = await getAdvice();
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
    extra.inlineKeyboard = getInlineButton('advice', '💣 Жги');
  }

  await ctx.replySafe(ctx.format`${adviceText}`, extra);
}, phrases);
