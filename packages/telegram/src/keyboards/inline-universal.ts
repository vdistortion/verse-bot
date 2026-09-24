import { InlineKeyboard } from 'grammy';
import type { UniversalKeyboardButton } from '@verse-bot/core';

export function createTelegramInlineKeyboard(
  universalKeyboard: UniversalKeyboardButton[][],
): InlineKeyboard {
  const inlineKeyboard = new InlineKeyboard([]);

  universalKeyboard.forEach((row) => {
    const rowButtons = row.map((btn) =>
      InlineKeyboard.text(btn.label, btn.callbackData ?? btn.command ?? btn.label),
    );
    inlineKeyboard.row(...rowButtons);
  });

  return inlineKeyboard;
}
